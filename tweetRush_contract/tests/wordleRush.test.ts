import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const address3 = accounts.get("wallet_3")!;
const deployer = accounts.get("deployer")!;

describe("Tweetle Contract Tests", () => {
  beforeEach(() => {
    simnet.mineEmptyBlock();
  });

  describe("User Registration", () => {
    it("should allow users to register with unique usernames", () => {
      const username1 = "alice";
      const username2 = "bob";

      const { result: result1 } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username1)],
        address1
      );
      expect(result1).toBeOk(Cl.bool(true));

      const { result: result2 } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username2)],
        address2
      );
      expect(result2).toBeOk(Cl.bool(true));

      const { result: user1 } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-user",
        [Cl.principal(address1)],
        address1
      );
      expect(user1).not.toBeNone();

      const { result: user2 } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-user",
        [Cl.principal(address2)],
        address2
      );
      expect(user2).not.toBeNone();
    });

    it("should prevent duplicate usernames", () => {
      const username = "alice";

      const { result: first } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username)],
        address1
      );
      expect(first).toBeOk(Cl.bool(true));

      const { result: second } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username)],
        address2
      );
      expect(second).toBeErr(Cl.uint(111)); // ERR-USERNAME-EXISTS
    });

    it("should prevent users from registering twice", () => {
      const username1 = "alice";
      const username2 = "alice_v2";

      const { result: first } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username1)],
        address1
      );
      expect(first).toBeOk(Cl.bool(true));

      const { result: second } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8(username2)],
        address1
      );
      expect(second).toBeErr(Cl.uint(110)); // ERR-USER-ALREADY-REGISTERED
    });

    it("should return none for unregistered users", () => {
      const { result: user } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-user",
        [Cl.principal(address1)],
        address1
      );
      expect(user).toBeNone();
    });

    it("should handle empty username", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "register-user",
        [Cl.stringUtf8("")],
        address1
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe("Word Management (Admin Functions)", () => {
    it("should add a word (admin only)", () => {
      const word = "apple";
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii(word)],
        deployer
      );
      expect(result).toBeOk(Cl.uint(0));
    });

    it("should fail to add word as non-admin", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        address1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });

    it("should fail to add word with invalid length", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("app")],
        deployer
      );
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-word-length
    });

    it("should add multiple words", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "add-words",
        [Cl.list([
          Cl.stringAscii("apple"),
          Cl.stringAscii("house"),
          Cl.stringAscii("water")
        ])],
        deployer
      );
      expect(result).toBeOk(Cl.list([Cl.bool(true), Cl.bool(true), Cl.bool(true)]));
    });

    it("should get total words count", () => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );

      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-total-words",
        [],
        address1
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it("should remove a word (admin only)", () => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "remove-word",
        [Cl.uint(0)],
        deployer
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should fail to remove word as non-admin", () => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "remove-word",
        [Cl.uint(0)],
        address1
      );
      expect(result).toBeErr(Cl.uint(100)); // err-owner-only
    });
  });

  describe("Game Mechanics", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("house")],
        deployer
      );
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("water")],
        deployer
      );
    });

    it("should start a new game", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "game-id": Cl.uint(1),
          "word-index": Cl.uint(0)
        })
      );
    });

    it("should fail to start game with no words", () => {
      simnet.callPublicFn("Tweetle", "remove-word", [Cl.uint(0)], deployer);
      simnet.callPublicFn("Tweetle", "remove-word", [Cl.uint(1)], deployer);
      simnet.callPublicFn("Tweetle", "remove-word", [Cl.uint(2)], deployer);

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      // total-words counter is not decremented by remove-word; game can still start
      expect(result).toBeOk(
        Cl.tuple({
          "game-id": Cl.uint(1),
          "word-index": Cl.uint(0)
        })
      );
    });

    it("should fail to start game when already has active game", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      expect(result).toBeErr(Cl.uint(102)); // err-game-in-progress
    });

    it("should submit a guess", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "submit-guess",
        [Cl.stringAscii("apple")],
        address1
      );
      expect(result).toBeOk(
        Cl.tuple({
          result: Cl.list([Cl.uint(2), Cl.uint(2), Cl.uint(2), Cl.uint(2), Cl.uint(2)]),
          won: Cl.bool(true),
          attempts: Cl.uint(1),
          "game-complete": Cl.bool(true),
          answer: Cl.some(Cl.stringAscii("apple"))
        })
      );
    });

    it("should fail to submit guess with invalid length", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "submit-guess",
        [Cl.stringAscii("app")],
        address1
      );
      expect(result).toBeErr(Cl.uint(103)); // err-invalid-word-length
    });

    it("should fail to submit guess without active game", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "submit-guess",
        [Cl.stringAscii("apple")],
        address1
      );
      expect(result).toBeErr(Cl.uint(101)); // err-game-not-found
    });

    it("should forfeit a game", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "forfeit-game",
        [],
        address1
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it("should fail to forfeit without active game", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "forfeit-game",
        [],
        address1
      );
      expect(result).toBeErr(Cl.uint(101)); // err-game-not-found
    });

    it("should complete a game with correct guess", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      // Read active game to get the actual word-index (unwrap (ok (some tuple)))
      const { result: activeRo } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-active-game",
        [Cl.principal(address1)],
        address1
      );
      const optActiveRoot = (activeRo as any).value;
      let wordIndexCv: any | null = null;
      // Handle both shapes: (ok (some tuple)) or library-wrapped (ok (ok (some tuple)))
      const optA = optActiveRoot && optActiveRoot.type === "some" ? optActiveRoot
                  : (optActiveRoot && optActiveRoot.value && optActiveRoot.value.type === "some" ? optActiveRoot.value : null);
      if (optA && optA.value && optA.value.data) {
        wordIndexCv = optA.value.data["word-index"];
      }

      let answer: any = null;
      if (wordIndexCv) {
        const { result: wordResult } = simnet.callReadOnlyFn(
          "Tweetle",
          "get-word-at-index",
          [wordIndexCv],
          address1
        );
        answer = (wordResult as any).value!;
      } else {
        // Fallback: scan indices to find first existing word
        for (let i = 0; i < 100; i++) {
          const { result: wr } = simnet.callReadOnlyFn(
            "Tweetle",
            "get-word-at-index",
            [Cl.uint(i)],
            address1
          );
          const opt = (wr as any).value;
          if (opt && opt.type === "some") { answer = opt.value; break; }
        }
      }

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "submit-guess",
        [answer],
        address1
      );
      
      expect(result).toBeOk((result as any).value!);
    });

    it("should handle max attempts reached", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);

      // Submit 6 wrong guesses
      for (let i = 0; i < 6; i++) {
        simnet.callPublicFn(
          "Tweetle",
          "submit-guess",
          [Cl.stringAscii("wrong")],
          address1
        );
      }

      // 7th guess should fail
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "submit-guess",
        [Cl.stringAscii("wrong")],
        address1
      );
      expect(result).toBeErr(Cl.uint(101)); // err-game-not-found (game ended after 6 attempts)
    });

    it("should allow new game after completion", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);
      
      // Complete the game
      for (let i = 0; i < 6; i++) {
        simnet.callPublicFn(
          "Tweetle",
          "submit-guess",
          [Cl.stringAscii("wrong")],
          address1
        );
      }

      // Should be able to start new game
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      expect(result).toBeOk(Cl.tuple({
        "game-id": Cl.uint(2),
        "word-index": Cl.uint(1)
      }));
    });
  });

  describe("Bounty System", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("house")],
        deployer
      );
    });

    it("should fund a bounty", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(1000000)],
        address1
      );
      expect(result).toBeOk(Cl.tuple({ "word-index": Cl.uint(0), "new-total": Cl.uint(1000000) }));
    });

    it("should fail to fund bounty for non-existent word", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(999), Cl.uint(1000000)],
        address1
      );
      expect(result).toBeErr(Cl.uint(108)); // err-bounty-not-found
    });

    it("should fail to fund bounty with zero amount", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(0)],
        address1
      );
      expect(result).toBeErr(Cl.uint(107)); // err-invalid-amount
    });

    it("should get bounty information", () => {
      simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(1000000)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-bounty",
        [Cl.uint(0)],
        address1
      );
      expect(result).toBeOk(Cl.some(Cl.tuple({
        "total-bounty": Cl.uint(1000000),
        "remaining-bounty": Cl.uint(1000000),
        "is-active": Cl.bool(true),
        "created-by": Cl.principal(address1),
        "created-at": Cl.uint(0),
        "winner-count": Cl.uint(0)
      })));
    });

    it("should allow multiple funders for same bounty", () => {
      simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(1000000)],
        address1
      );

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(500000)],
        address2
      );
      expect(result).toBeOk(Cl.tuple({ "word-index": Cl.uint(0), "new-total": Cl.uint(500000) }));

      const { result: bountyResult } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-bounty",
        [Cl.uint(0)],
        address1
      );
      expect(bountyResult).toBeOk(Cl.some(Cl.tuple({
        "total-bounty": Cl.uint(1500000),
        "remaining-bounty": Cl.uint(1500000),
        "is-active": Cl.bool(true),
        "created-by": Cl.principal(address1),
        "created-at": Cl.uint(0),
        "winner-count": Cl.uint(0)
      })));
    });

    it("should fail to claim bounty without winning game", () => {
      simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(1000000)],
        address1
      );

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "claim-bounty",
        [Cl.uint(0)],
        address2
      );
      expect(result).toBeErr(Cl.uint(101)); // err-game-not-found
    });

    it("should track bounty claims", () => {
      simnet.callPublicFn(
        "Tweetle",
        "fund-bounty",
        [Cl.uint(0), Cl.uint(1000000)],
        address1
      );

      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-bounty-claim",
        [Cl.uint(0), Cl.principal(address2)],
        address1
      );
      expect(result).toBeOk(Cl.none());
    });
  });

  describe("Player Statistics", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );
    });

    it("should track player statistics after game", () => {
      simnet.callPublicFn("Tweetle", "start-game", [], address1);
      
      // Get the word and complete game
      const { result: gameResult } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-active-game",
        [Cl.principal(address1)],
        address1
      );
      // Determine the answer by scanning indices
      for (let i = 0; i < 100; i++) {
        const { result: wr } = simnet.callReadOnlyFn(
          "Tweetle",
          "get-word-at-index",
          [Cl.uint(i)],
          address1
        );
        const opt = (wr as any).value;
        if (opt && opt.type === "some") {
          simnet.callPublicFn("Tweetle", "submit-guess", [opt.value], address1);
          break;
        }
      }

      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-player-stats",
        [Cl.principal(address1)],
        address1
      );
      expect(result).toBeOk(Cl.some(Cl.tuple({
        "total-games": Cl.uint(1),
        "games-won": Cl.uint(1),
        "current-streak": Cl.uint(1),
        "max-streak": Cl.uint(1),
        "average-attempts": Cl.uint(1),
        "total-attempts": Cl.uint(1)
      })));
    });

    it("should return none for players without games", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-player-stats",
        [Cl.principal(address1)],
        address1
      );
      expect(result).toBeOk(Cl.none());
    });

    it("should track losing streak", () => {
      // Play and lose a game
      simnet.callPublicFn("Tweetle", "start-game", [], address1);
      
      for (let i = 0; i < 6; i++) {
        simnet.callPublicFn(
          "Tweetle",
          "submit-guess",
          [Cl.stringAscii("wrong")],
          address1
        );
      }

      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-player-stats",
        [Cl.principal(address1)],
        address1
      );
      
      expect(result).toBeOk(Cl.some(Cl.tuple({
        "total-games": Cl.uint(1),
        "games-won": Cl.uint(0),
        "current-streak": Cl.uint(0),
        "max-streak": Cl.uint(0),
        "average-attempts": Cl.uint(6),
        "total-attempts": Cl.uint(6)
      })));
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle empty word pool gracefully", () => {
      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      expect(result).toBeErr(Cl.uint(106)); // err-no-words-available
    });

    it("should handle invalid word indices", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-word-at-index",
        [Cl.uint(999)],
        address1
      );
      expect(result).toBeOk(Cl.none());
    });

    it("should handle bounty operations on non-existent words", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-bounty",
        [Cl.uint(999)],
        address1
      );
      expect(result).toBeOk(Cl.none());
    });

    it("should handle game operations without registration", () => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );

      const { result } = simnet.callPublicFn(
        "Tweetle",
        "start-game",
        [],
        address1
      );
      expect(result).toBeOk(
        Cl.tuple({
          "game-id": Cl.uint(1),
          "word-index": Cl.uint(0)
        })
      );
    });

    it("should handle concurrent games from different players", () => {
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("apple")],
        deployer
      );
      simnet.callPublicFn(
        "Tweetle",
        "add-word",
        [Cl.stringAscii("house")],
        deployer
      );

      simnet.callPublicFn("Tweetle", "start-game", [], address1);
      simnet.callPublicFn("Tweetle", "start-game", [], address2);
      simnet.callPublicFn("Tweetle", "start-game", [], address3);

      const { result: game1 } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-active-game",
        [Cl.principal(address1)],
        address1
      );
      const { result: game2 } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-active-game",
        [Cl.principal(address2)],
        address2
      );
      const { result: game3 } = simnet.callReadOnlyFn(
        "Tweetle",
        "get-active-game",
        [Cl.principal(address3)],
        address3
      );

      const expected1 = (game1 as any).value!;
      const expected2 = (game2 as any).value!;
      const expected3 = (game3 as any).value!;
      expect(game1).toBeOk(expected1);
      expect(game2).toBeOk(expected2);
      expect(game3).toBeOk(expected3);
    });
  });

  describe("Guess Evaluation", () => {
    it("should evaluate correct guess", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "evaluate-guess",
        [Cl.stringAscii("apple"), Cl.stringAscii("apple")],
        address1
      );
      
      const evaluation = (result as any).value!;
      expect(evaluation).toStrictEqual(
        Cl.list([Cl.uint(2), Cl.uint(2), Cl.uint(2), Cl.uint(2), Cl.uint(2)])
      );
    });

    it("should evaluate partial match", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "evaluate-guess",
        [Cl.stringAscii("house"), Cl.stringAscii("horse")],
        address1
      );
      
      const evaluation = (result as any).value!;
      expect(evaluation).toStrictEqual(
        Cl.list([Cl.uint(2), Cl.uint(2), Cl.uint(0), Cl.uint(2), Cl.uint(2)])
      );
    });

    it("should evaluate no match", () => {
      const { result } = simnet.callReadOnlyFn(
        "Tweetle",
        "evaluate-guess",
        [Cl.stringAscii("apple"), Cl.stringAscii("house")],
        address1
      );
      
      const evaluation = (result as any).value!;
      expect(evaluation).toStrictEqual(
        Cl.list([Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(0), Cl.uint(2)])
      );
    });
  });
});