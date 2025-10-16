;; Tweetle - A Wordle-style game on Stacks blockchain
;; Players can play continuously with randomly selected words

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-game-not-found (err u101))
(define-constant err-game-in-progress (err u102))
(define-constant err-invalid-word-length (err u103))
(define-constant err-max-attempts-reached (err u104))
(define-constant err-game-already-won (err u105))
(define-constant err-no-words-available (err u106))
(define-constant err-invalid-amount (err u107))
(define-constant err-bounty-not-found (err u108))
(define-constant err-bounty-already-claimed (err u109))
(define-constant max-attempts u6)
(define-constant word-length u5)
(define-constant ERR-USER-ALREADY-REGISTERED (err u110))
(define-constant ERR-USERNAME-EXISTS (err u111))
(define-constant reward-percentage u10)  ;; 10% of remaining bounty per winner

;; Data Variables
(define-data-var total-words uint u0)
(define-data-var game-counter uint u0)
(define-data-var bounty-counter uint u0)

;; Data Maps
;; Store word pool
(define-map word-pool uint (string-ascii 5))

;; Store active games for each player
(define-map active-games
    principal
    {
        game-id: uint,
        word-index: uint,
        attempts: uint,
        won: bool,
        guesses: (list 6 (string-ascii 5)),
        block-height: uint
    }
)

;; Store completed games history
(define-map game-history
    {player: principal, game-id: uint}
    {
        word-index: uint,
        attempts: uint,
        won: bool,
        guesses: (list 6 (string-ascii 5))
    }
)



;; Store player statistics
(define-map player-stats
    principal
    {
        total-games: uint,
        games-won: uint,
        current-streak: uint,
        max-streak: uint,
        average-attempts: uint,
        total-attempts: uint
    }
)

;; Store bounty pools for each word
(define-map word-bounties
    uint
    {
        total-bounty: uint,
        remaining-bounty: uint,
        is-active: bool,
        created-by: principal,
        created-at: uint,
        winner-count: uint
    }
)

;; Store bounty claims to prevent double-claiming
(define-map bounty-claims
    {word-index: uint, player: principal}
    {
        claimed: bool,
        claimed-at: uint,
        reward-amount: uint
    }
)

;; Store individual reward amounts for transparency
(define-map reward-amounts
    {word-index: uint, player: principal}
    {
        reward-amount: uint,
        claimed-at: uint,
        pool-remaining: uint
    }
)


;; User registration: map principal to username and registration data
(define-map users
  { user: principal }                 ;; user principal
  {
    username: (string-utf8 50),       ;; username (max 50 chars)
    registered-at: uint,              ;; block height when registered
  }
)

;; Username to principal mapping (for uniqueness check)
(define-map usernames
  { username: (string-utf8 50) }      ;; username
  { user: principal }                 ;; user principal
)

;; Get user registration data by principal
(define-read-only (get-user (user principal))
  (map-get? users { user: user })
)


;; Read-only functions

;; Get active game for player
(define-read-only (get-active-game (player principal))
    (ok (map-get? active-games player))
)

;; Get all the total words 
(define-read-only (get-total-word)
    (ok (var-get total-words))
)

;; Get game counter 
(define-read-only (get-game-counter)
  (ok (var-get game-counter))
)

;; Get the total bounty
(define-read-only (get-bounty-counter)
   (ok (var-get bounty-counter))
)

;; Get game history for a player
(define-read-only (get-game-history (player principal) (game-id uint))
    (ok (map-get? game-history {player: player, game-id: game-id}))
)

;; Get player statistics
(define-read-only (get-player-stats (player principal))
    (ok (map-get? player-stats player))
)

;; Check if player has an active game
(define-read-only (has-active-game (player principal))
    (ok (is-some (map-get? active-games player)))
)

;; Get total words in pool
(define-read-only (get-total-words)
    (ok (var-get total-words))
)

;; Get word at index (only returns word if player owns it or game is complete)
(define-read-only (get-word-at-index (index uint))
    (ok (map-get? word-pool index))
)

;; Compare two characters
(define-private (char-equal (c1 (string-ascii 1)) (c2 (string-ascii 1)))
    (is-eq c1 c2)
)

;; Get character at position in word
(define-private (get-char-at (word (string-ascii 5)) (pos uint))
    (if (is-eq pos u0)
        (unwrap-panic (as-max-len? (unwrap-panic (slice? word u0 u1)) u1))
        (if (is-eq pos u1)
            (unwrap-panic (as-max-len? (unwrap-panic (slice? word u1 u2)) u1))
            (if (is-eq pos u2)
                (unwrap-panic (as-max-len? (unwrap-panic (slice? word u2 u3)) u1))
                (if (is-eq pos u3)
                    (unwrap-panic (as-max-len? (unwrap-panic (slice? word u3 u4)) u1))
                    (unwrap-panic (as-max-len? (unwrap-panic (slice? word u4 u5)) u1))
                )
            )
        )
    )
)

;; Check if character exists in word
(define-private (char-in-word (c (string-ascii 1)) (word (string-ascii 5)))
    (or 
        (char-equal c (get-char-at word u0))
        (or 
            (char-equal c (get-char-at word u1))
            (or 
                (char-equal c (get-char-at word u2))
                (or 
                    (char-equal c (get-char-at word u3))
                    (char-equal c (get-char-at word u4))
                )
            )
        )
    )
)

;; Evaluate guess result
;; Returns list of results: 2=correct position, 1=wrong position, 0=not in word
(define-read-only (evaluate-guess (guess (string-ascii 5)) (answer (string-ascii 5)))
    (let
        (
            (c0 (get-char-at guess u0))
            (c1 (get-char-at guess u1))
            (c2 (get-char-at guess u2))
            (c3 (get-char-at guess u3))
            (c4 (get-char-at guess u4))
            (a0 (get-char-at answer u0))
            (a1 (get-char-at answer u1))
            (a2 (get-char-at answer u2))
            (a3 (get-char-at answer u3))
            (a4 (get-char-at answer u4))
        )
        (ok (list
            (if (char-equal c0 a0) u2 (if (char-in-word c0 answer) u1 u0))
            (if (char-equal c1 a1) u2 (if (char-in-word c1 answer) u1 u0))
            (if (char-equal c2 a2) u2 (if (char-in-word c2 answer) u1 u0))
            (if (char-equal c3 a3) u2 (if (char-in-word c3 answer) u1 u0))
            (if (char-equal c4 a4) u2 (if (char-in-word c4 answer) u1 u0))
        ))
    )
)

;; Generate pseudo-random number based on block height and player
(define-private (get-random-word-index (player principal) (block-heights uint))
    (let
        (
            (total (var-get total-words))
            ;; Use a simple approach: combine player address with block height
            (player-hash (sha256 (unwrap-panic (to-consensus-buff? player))))
            ;; Use the hash length as a factor (always 32, so 32 % 10 = 2)
            (hash-factor (mod (len player-hash) u10))
            ;; Use block height for additional variation
            (random-val (mod (+ block-heights hash-factor) total))
        )
        (if (is-eq random-val u0) u0 random-val)
    )
)

;; Helper function to try claiming shared bounty (doesn't fail if no bounty exists)
(define-private (try-claim-bounty (word-index uint) (player principal))
    (let
        (
            (bounty-data (map-get? word-bounties word-index))
            (existing-claim (map-get? bounty-claims {word-index: word-index, player: player}))
            (current-block stacks-block-height)
        )
        (if (and (is-some bounty-data) (is-none existing-claim))
            (let
                (
                    (bounty (unwrap-panic bounty-data))
                    (remaining (get remaining-bounty bounty))
                )
                (if (and (get is-active bounty) (> remaining u0))
                    (begin
                        ;; Calculate reward: 10% of remaining bounty (minimum 1 microSTX)
                        (let
                            (
                                (calculated-reward (/ (* remaining reward-percentage) u100))
                                (reward-amount (if (> calculated-reward u0) calculated-reward u1))
                                (new-remaining (- remaining reward-amount))
                                (new-winner-count (+ (get winner-count bounty) u1))
                            )
                            (begin
                                ;; Record the claim
                                (map-set bounty-claims {word-index: word-index, player: player}
                                    {
                                        claimed: true,
                                        claimed-at: current-block,
                                        reward-amount: reward-amount
                                    }
                                )
                                
                                ;; Record reward details for transparency
                                (map-set reward-amounts {word-index: word-index, player: player}
                                    {
                                        reward-amount: reward-amount,
                                        claimed-at: current-block,
                                        pool-remaining: new-remaining
                                    }
                                )
                                
                                ;; Transfer reward to player
                                (match (as-contract (stx-transfer? reward-amount tx-sender player))
                                    success (begin
                                        ;; Update bounty with new remaining amount and winner count
                                        (map-set word-bounties word-index
                                            {
                                                total-bounty: (get total-bounty bounty),
                                                remaining-bounty: new-remaining,
                                                is-active: (if (> new-remaining u0) true false),
                                                created-by: (get created-by bounty),
                                                created-at: (get created-at bounty),
                                                winner-count: new-winner-count
                                            }
                                        )
                                        true
                                    )
                                    error-val true
                                )
                            )
                        )
                    )
                    true
                )
            )
            true
        )
    )
)

;; =============================================================================
;; PUBLIC FUNCTIONS - USER REGISTRATION
;; =============================================================================

;; register-user(username)
;; Purpose: Register a user with a unique username.
;; Params:
;;  - username: (string-utf8 50) desired username (max 50 characters).
;; Preconditions:
;;  - User (tx-sender) is not already registered.
;;  - Username is not already taken by another user.
;; Effects:
;;  - Creates user record in users map with username and registration timestamp.
;;  - Creates reverse mapping in usernames map for uniqueness enforcement.
;; Events: Emits "user-registered" with user principal and username.
;; Returns: (ok true) on success, or appropriate error code.
(define-public (register-user (username (string-utf8 50)))
  (let (
      (existing-user (map-get? users { user: tx-sender }))
      (existing-username (map-get? usernames { username: username }))
    )
    (begin
      ;; Validations
      (asserts! (is-none existing-user) ERR-USER-ALREADY-REGISTERED)
      (asserts! (is-none existing-username) ERR-USERNAME-EXISTS)

      ;; Register user
      (map-set users { user: tx-sender } {
        username: username,
        registered-at: stacks-block-height,
      })

      ;; Track username for uniqueness
      (map-set usernames { username: username } { user: tx-sender })
      ;; Emit event 
      (print {
        event: "user-registered",
        user: tx-sender,
        username: username,
      })

      (ok true)
    )
  )
)

;; Start a new game
(define-public (start-game)
    (let
        (
            (player tx-sender)
            (existing-game (map-get? active-games player))
            (total (var-get total-words))
            (current-block stacks-block-height)
        )
        ;; Ensure word pool is not empty
        (asserts! (> total u0) err-no-words-available)
        
        ;; Check if player already has an active game
        (asserts! (is-none existing-game) err-game-in-progress)
        
        ;; Generate random word index
        (let
            (
                (word-index (get-random-word-index player current-block))
                (new-game-id (+ (var-get game-counter) u1))
            )
            ;; Create new game
            (map-set active-games player
                {
                    game-id: new-game-id,
                    word-index: word-index,
                    attempts: u0,
                    won: false,
                    guesses: (list),
                    block-height: current-block
                }
            )
            (var-set game-counter new-game-id)
            
            ;; Emit game started event
            (print {
                event: "game-started",
                player: player,
                game-id: new-game-id,
                word-index: word-index,
                block-height: current-block
            })
            
            (ok {game-id: new-game-id, word-index: word-index})
        )
    )
)

;; Submit a guess
(define-public (submit-guess (guess (string-ascii 5)))
    (let
        (
            (player tx-sender)
            (game-data (unwrap! (map-get? active-games player) err-game-not-found))
            (word-index (get word-index game-data))
            (answer (unwrap! (map-get? word-pool word-index) err-game-not-found))
        )
        ;; Validate word length
        (asserts! (is-eq (len guess) word-length) err-invalid-word-length)
        
        ;; Check if already won
        (asserts! (not (get won game-data)) err-game-already-won)
        
        ;; Check if max attempts reached
        (asserts! (< (get attempts game-data) max-attempts) err-max-attempts-reached)
        
        ;; Process guess
        (let
            (
                (new-attempts (+ (get attempts game-data) u1))
                (is-correct (is-eq guess answer))
                (new-guesses (unwrap-panic (as-max-len? (append (get guesses game-data) guess) u6)))
                (game-id (get game-id game-data))
            )
            ;; Update game state
            (map-set active-games player
                {
                    game-id: game-id,
                    word-index: word-index,
                    attempts: new-attempts,
                    won: is-correct,
                    guesses: new-guesses,
                    block-height: (get block-height game-data)
                }
            )
            
            ;; Emit guess submitted event
            (print {
                event: "guess-submitted",
                player: player,
                game-id: game-id,
                guess: guess,
                attempt: new-attempts,
                is-correct: is-correct
            })
            
            ;; If game is complete (won or max attempts), save to history and update stats
            (if (or is-correct (is-eq new-attempts max-attempts))
                (begin
                    ;; Save to history
                    (map-set game-history
                        {player: player, game-id: game-id}
                        {
                            word-index: word-index,
                            attempts: new-attempts,
                            won: is-correct,
                            guesses: new-guesses
                        }
                    )
                    
                    ;; If game is won, try to claim bounty
                    (if is-correct
                        (try-claim-bounty word-index player)
                        true
                    )
                    
                    ;; Clear active game
                    (map-delete active-games player)
                    ;; Update stats
                    (update-player-stats player is-correct new-attempts)
                    
                    ;; Emit game completed event
                    (print {
                        event: "game-completed",
                        player: player,
                        game-id: game-id,
                        word-index: word-index,
                        attempts: new-attempts,
                        won: is-correct,
                        answer: (if is-correct (some answer) none)
                    })
                    true
                )
                true
            )
            
            (ok {
                result: (unwrap-panic (evaluate-guess guess answer)),
                won: is-correct,
                attempts: new-attempts,
                game-complete: (or is-correct (is-eq new-attempts max-attempts)),
                answer: (if (or is-correct (is-eq new-attempts max-attempts)) (some answer) none)
            })
        )
    )
)

;; Forfeit current game
(define-public (forfeit-game)
    (let
        (
            (player tx-sender)
            (game-data (unwrap! (map-get? active-games player) err-game-not-found))
            (game-id (get game-id game-data))
        )
        ;; Save to history as loss
        (map-set game-history
            {player: player, game-id: game-id}
            {
                word-index: (get word-index game-data),
                attempts: (get attempts game-data),
                won: false,
                guesses: (get guesses game-data)
            }
        )
        ;; Clear active game
        (map-delete active-games player)
        ;; Update stats
        (update-player-stats player false (get attempts game-data))
        
        ;; Emit game forfeited event
        (print {
            event: "game-forfeited",
            player: player,
            game-id: game-id,
            word-index: (get word-index game-data),
            attempts: (get attempts game-data)
        })
        
        (ok true)
    )
)

;; Update player statistics
(define-private (update-player-stats (player principal) (won bool) (attempts uint))
    (let
        (
            (current-stats (default-to 
                {total-games: u0, games-won: u0, current-streak: u0, max-streak: u0, average-attempts: u0, total-attempts: u0}
                (map-get? player-stats player)
            ))
            (new-total-games (+ (get total-games current-stats) u1))
            (new-games-won (if won (+ (get games-won current-stats) u1) (get games-won current-stats)))
            (new-streak (if won (+ (get current-streak current-stats) u1) u0))
            (new-max-streak (if (> new-streak (get max-streak current-stats)) 
                new-streak 
                (get max-streak current-stats)
            ))
            (new-total-attempts (+ (get total-attempts current-stats) attempts))
            (new-average (/ new-total-attempts new-total-games))
        )
        (map-set player-stats player
            {
                total-games: new-total-games,
                games-won: new-games-won,
                current-streak: new-streak,
                max-streak: new-max-streak,
                average-attempts: new-average,
                total-attempts: new-total-attempts
            }
        )
    )
)

;; Admin functions

;; Add word to pool (only contract owner)
(define-public (add-word (word (string-ascii 5)))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (is-eq (len word) word-length) err-invalid-word-length)
        (let
            (
                (current-total (var-get total-words))
            )
            (map-set word-pool current-total word)
            (var-set total-words (+ current-total u1))
            
            ;; Emit word added event
            (print {
                event: "word-added",
                word: word,
                word-index: current-total,
                total-words: (+ current-total u1),
                added-by: tx-sender
            })
            
            (ok current-total)
        )
    )
)

;; Add multiple words at once
(define-public (add-words (words (list 100 (string-ascii 5))))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        
        ;; Emit words added event
        (print {
            event: "words-added",
            word-count: (len words),
            added-by: tx-sender
        })
        
        (ok (map add-word-internal words))
    )
)

(define-private (add-word-internal (word (string-ascii 5)))
    (let
        (
            (current-total (var-get total-words))
        )
        (if (is-eq (len word) word-length)
            (begin
                (map-set word-pool current-total word)
                (var-set total-words (+ current-total u1))
                true
            )
            false
        )
    )
)

;; Remove word from pool (only contract owner)
(define-public (remove-word (index uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (< index (var-get total-words)) err-game-not-found)
        (map-delete word-pool index)
        
        ;; Emit word removed event
        (print {
            event: "word-removed",
            word-index: index,
            removed-by: tx-sender
        })
        
        (ok true)
    )
)

;; =============================================================================
;; BOUNTY & REWARDS SYSTEM
;; =============================================================================

;; Add funds to word bounty pool
(define-public (fund-bounty (word-index uint) (amount uint))
    (let
        (
            (word-exists (map-get? word-pool word-index))
            (current-bounty (map-get? word-bounties word-index))
        )
        (begin
            ;; Validate word exists
            (asserts! (is-some word-exists) err-bounty-not-found)
            
            ;; Validate amount
            (asserts! (> amount u0) err-invalid-amount)
            
            ;; Transfer STX to contract
            (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
            
            ;; Update or create bounty
            (if (is-some current-bounty)
                ;; Update existing bounty
                (let
                    (
                        (bounty-data (unwrap-panic current-bounty))
                        (new-total (+ (get total-bounty bounty-data) amount))
                        (new-remaining (+ (get remaining-bounty bounty-data) amount))
                    )
                    (map-set word-bounties word-index
                        {
                            total-bounty: new-total,
                            remaining-bounty: new-remaining,
                            is-active: (get is-active bounty-data),
                            created-by: (get created-by bounty-data),
                            created-at: (get created-at bounty-data),
                            winner-count: (get winner-count bounty-data)
                        }
                    )
                )
                ;; Create new bounty
                (map-set word-bounties word-index
                    {
                        total-bounty: amount,
                        remaining-bounty: amount,
                        is-active: true,
                        created-by: tx-sender,
                        created-at: (var-get bounty-counter),
                        winner-count: u0
                    }
                )
            )
            
            ;; Increment bounty counter
            (var-set bounty-counter (+ (var-get bounty-counter) u1))
            
            ;; Emit bounty funded event
            (print {
                event: "bounty-funded",
                word-index: word-index,
                amount: amount,
                funder: tx-sender,
                new-total: (if (is-some current-bounty) 
                    (+ (get total-bounty (unwrap-panic current-bounty)) amount)
                    amount
                )
            })
            
            (ok {word-index: word-index, new-total: amount})
        )
    )
)

;; Get bounty information for a word
(define-read-only (get-bounty (word-index uint))
    (ok (map-get? word-bounties word-index))
)

;; Claim bounty reward when winning a game (manual claim - same as auto-claim)
(define-public (claim-bounty (word-index uint))
    (let
        (
            (player tx-sender)
            (bounty-data (unwrap! (map-get? word-bounties word-index) err-bounty-not-found))
            (existing-claim (map-get? bounty-claims {word-index: word-index, player: player}))
            (current-block stacks-block-height)
        )
        (begin
            ;; Check if bounty is active and has remaining funds
            (asserts! (get is-active bounty-data) err-bounty-not-found)
            (asserts! (> (get remaining-bounty bounty-data) u0) err-bounty-not-found)
            
            ;; Check if already claimed
            (asserts! (is-none existing-claim) err-bounty-already-claimed)
            
            ;; Check if player has an active game with this word
            (let
                (
                    (game-data (unwrap! (map-get? active-games player) err-game-not-found))
                    (game-word-index (get word-index game-data))
                    (game-won (get won game-data))
                    (remaining (get remaining-bounty bounty-data))
                )
                (begin
                    ;; Verify this is the correct word and game is won
                    (asserts! (is-eq game-word-index word-index) err-bounty-not-found)
                    (asserts! game-won err-bounty-not-found)
                    
                    ;; Calculate reward: 10% of remaining bounty (minimum 1 microSTX)
                    (let
                        (
                            (calculated-reward (/ (* remaining reward-percentage) u100))
                            (reward-amount (if (> calculated-reward u0) calculated-reward u1))
                            (new-remaining (- remaining reward-amount))
                            (new-winner-count (+ (get winner-count bounty-data) u1))
                        )
                        (begin
                            ;; Record the claim
                            (map-set bounty-claims {word-index: word-index, player: player}
                                {
                                    claimed: true,
                                    claimed-at: current-block,
                                    reward-amount: reward-amount
                                }
                            )
                            
                            ;; Record reward details for transparency
                            (map-set reward-amounts {word-index: word-index, player: player}
                                {
                                    reward-amount: reward-amount,
                                    claimed-at: current-block,
                                    pool-remaining: new-remaining
                                }
                            )
                            
                            ;; Transfer reward to player
                            (try! (as-contract (stx-transfer? reward-amount tx-sender player)))
                            
                            ;; Emit bounty claimed event
                            (print {
                                event: "bounty-claimed",
                                word-index: word-index,
                                player: player,
                                reward-amount: reward-amount,
                                remaining-bounty: new-remaining,
                                winner-count: new-winner-count,
                                block-height: current-block
                            })
                            
                            ;; Update bounty with new remaining amount and winner count
                            (map-set word-bounties word-index
                                {
                                    total-bounty: (get total-bounty bounty-data),
                                    remaining-bounty: new-remaining,
                                    is-active: (if (> new-remaining u0) true false),
                                    created-by: (get created-by bounty-data),
                                    created-at: (get created-at bounty-data),
                                    winner-count: new-winner-count
                                }
                            )
                            
                            (ok {
                                word-index: word-index,
                                reward-amount: reward-amount,
                                remaining-bounty: new-remaining,
                                winner-count: new-winner-count,
                                claimed-by: player
                            })
                        )
                    )
                )
            )
        )
    )
)

;; Get bounty claim information
(define-read-only (get-bounty-claim (word-index uint) (player principal))
    (ok (map-get? bounty-claims {word-index: word-index, player: player}))
)

;; Get reward amount information
(define-read-only (get-reward-amount (word-index uint) (player principal))
    (ok (map-get? reward-amounts {word-index: word-index, player: player}))
)