---
### **132. Palindrome Partitioning II**
**Link to Problem:** [https://leetcode.com/problems/palindrome-partitioning-ii/](https://leetcode.com/problems/palindrome-partitioning-ii/)

#### **1. Problem Statement**
Given a string `s`, the task is to partition `s` into one or more substrings, where each substring is a palindrome. The goal is to find the minimum number of cuts required to achieve such a partitioning.

For example, for the string "aab", a palindrome partitioning is ["aa", "b"], which can be achieved with one cut. This is the minimum possible, so the answer is 1.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward approach is to explore all possible ways to partition the string. We can use recursion (or backtracking) to generate every valid partition.

Let's define a recursive function, say `findMinCuts(startIndex)`, that calculates the minimum cuts needed for the substring `s[startIndex:]`.
1.  The base case: If `startIndex` is at or beyond the end of the string, no more cuts are needed, so we return 0.
2.  In the recursive step, we iterate from `startIndex` to the end of the string. Let the current index be `i`.
3.  For each `i`, we consider the substring `s[startIndex : i+1]`.
4.  If this substring is a palindrome, it's a valid first piece of our partition. We've made one cut (conceptually, after this piece). We then recursively call `findMinCuts(i+1)` to find the minimum cuts for the rest of the string.
5.  The total cuts for this choice would be `1 + findMinCuts(i+1)`.
6.  We try this for all possible `i` and take the minimum value among all valid palindrome partitions.

To avoid recomputing results for the same `startIndex`, we can add memoization, but the fundamental complexity remains high due to the repeated palindrome checks within the recursion.

**Python Code:**
```python
import sys

def is_palindrome(s, start, end):
    """Helper to check if a substring is a palindrome."""
    while start < end:
        if s[start] != s[end]:
            return False
        start += 1
        end -= 1
    return True

def minCut_brute_force(s: str) -> int:
    """
    Brute-force recursive solution to find the minimum cuts.
    Note: This will likely result in a "Time Limit Exceeded" error on LeetCode.
    """
    memo = {}

    def find_min_cuts(start_index):
        # If we've reached the end, no more partitions are needed.
        if start_index == len(s):
            return -1 # Base case: no cuts needed for an empty suffix

        if start_index in memo:
            return memo[start_index]

        min_cuts = sys.maxsize
        # Iterate through all possible end points for the current partition
        for i in range(start_index, len(s)):
            # Check if the substring s[start_index...i] is a palindrome
            if is_palindrome(s, start_index, i):
                # If it is, we make a cut here and find the cuts for the rest of the string.
                cuts_for_rest = find_min_cuts(i + 1)
                min_cuts = min(min_cuts, 1 + cuts_for_rest)
        
        memo[start_index] = min_cuts
        return min_cuts

    # The function returns (total_partitions - 1), so initial call gets the answer.
    return find_min_cuts(0)

# Example:
# print(minCut_brute_force("aab")) -> 1
```
**Complexity Analysis:**

*   **Time Complexity:** O(2^n * n). In the worst case (e.g., a string like "abcdef"), the recursion tree can branch out significantly. At each step, we iterate up to `n` times and perform a palindrome check that can take O(n) time. Even with memoization, the number of states is `n`, and each state computation involves a loop and palindrome checks, leading to at least an O(n^2) complexity if `is_palindrome` is O(1) (precomputed), but here it is O(n), so it's closer to O(n^3). The unmemoized version is exponential.
*   **Space Complexity:** O(n) for the recursion stack depth and the memoization dictionary.

---

#### **3. Optimized Approach: Two Pointers - Expanding From Center (Palindromes)**
**Intuition:**
The brute-force approach is slow because it re-evaluates which substrings are palindromes over and over. This problem has optimal substructure and overlapping subproblems, making it a perfect candidate for Dynamic Programming.

Let `dp[i]` be the minimum number of cuts needed for the prefix `s[0...i]`. Our goal is to find `dp[n-1]`.

The DP state transition would be:
`dp[i] = min(dp[j-1] + 1)` for all `0 <= j <= i` where the substring `s[j...i]` is a palindrome.
If `s[0...i]` itself is a palindrome, `dp[i] = 0`.

This still requires an efficient way to check `is_palindrome(s[j...i])`. A naive check would make the overall solution O(n^3). We can optimize this by finding all palindromes first.

This is where the **Expanding From Center** pattern comes in. It's the most efficient way to find all palindromic substrings. We can iterate through every possible center of a palindrome (there are `2n-1` such centers: `n` single-character centers and `n-1` inter-character centers) and expand outwards with two pointers.

By integrating this pattern directly into our DP calculation, we can update the `dp` array as we discover palindromes.

**Algorithm:**
1.  Initialize a `dp` array of size `n`, where `dp[i]` will store the min cuts for `s[0...i]`. A safe initial value is `dp[i] = i`, as the worst case is cutting after each character (e.g., "abc" -> "a|b|c", 2 cuts for index 2).
2.  Iterate through the string with an index `i` from `0` to `n-1`. This `i` will serve as the **center** of potential palindromes.
3.  **Odd Length Palindromes:**
    *   Use two pointers, `l = i` and `r = i`.
    *   Expand outwards: while `l >= 0`, `r < n`, and `s[l] == s[r]`.
    *   For each palindrome `s[l...r]` we find, we know we can form a partition of `s[0...r]` by taking this palindrome as the last segment. The number of cuts would be `1 +` (the min cuts for the part before it, `s[0...l-1]`).
    *   So, we update `dp[r] = min(dp[r], dp[l-1] + 1)`. If `l` is 0, it means the entire prefix `s[0...r]` is a palindrome, requiring 0 cuts.
    *   Decrement `l` and increment `r`.
4.  **Even Length Palindromes:**
    *   Use two pointers, `l = i` and `r = i + 1`.
    *   Perform the same expansion and DP update logic as above.
5.  After iterating through all centers, `dp[n-1]` will hold the minimum cuts for the entire string.

**Example Walkthrough (`s = "aab"`):**
*   `n = 3`, `dp = [0, 1, 2]` (initial worst-case cuts)
*   **`i = 0` (center):**
    *   **Odd:** `l=0, r=0` (`"a"`). `s[0]==s[0]`. `l=0` so it's a prefix. `dp[0] = min(dp[0], 0) = 0`.
    *   **Even:** `l=0, r=1` (`"aa"`). `s[0]==s[1]`. `l=0`. `dp[1] = min(dp[1], 0) = 0`.
*   **`i = 1` (center):**
    *   **Odd:** `l=1, r=1` (`"a"`). `s[1]==s[1]`. Palindrome is `s[1...1]`. Update `dp[1] = min(dp[1], dp[0]+1) = min(0, 0+1) = 0`.
    *   **Even:** `l=1, r=2` (`"ab"`). `s[1]!=s[2]`. Stop.
*   **`i = 2` (center):**
    *   **Odd:** `l=2, r=2` (`"b"`). `s[2]==s[2]`. Palindrome is `s[2...2]`. Update `dp[2] = min(dp[2], dp[1]+1) = min(2, 0+1) = 1`.
    *   **Even:** `l=2, r=3`. `r` is out of bounds. Stop.

Final `dp` array: `[0, 0, 1]`. The answer is `dp[2] = 1`.

**Python Code:**
```python
def minCut(s: str) -> int:
    n = len(s)
    if n <= 1:
        return 0

    # dp[i] will store the minimum cuts for the prefix s[0...i]
    # Initialize with the worst-case: cutting after every character.
    cuts = list(range(n))

    # Iterate through each character of the string, treating it as a potential
    # center of a palindrome.
    for i in range(n):
        # --- Pattern: Two Pointers - Expanding from Center ---

        # Case 1: Odd length palindrome, centered at i
        # The pointers start at the center and expand outwards.
        l, r = i, i
        while l >= 0 and r < n and s[l] == s[r]:
            # The substring s[l...r] is a palindrome.
            # We can form a partition for s[0...r] by taking this palindrome as the last piece.
            # The number of cuts is 1 (for the cut before s[l]) + the minimum cuts for s[0...l-1].
            # If l is 0, the entire prefix s[0...r] is a palindrome, so 0 cuts are needed.
            
            # This is the cost for the prefix before this palindrome
            prev_cuts = cuts[l-1] if l > 0 else -1
            
            # The new potential min cuts for prefix s[0...r]
            new_cuts = prev_cuts + 1
            
            # Update the minimum cuts for the prefix ending at r
            cuts[r] = min(cuts[r], new_cuts)
            
            # Expand the window
            l -= 1
            r += 1

        # Case 2: Even length palindrome, centered between i and i+1
        # The pointers start at i and i+1 and expand outwards.
        l, r = i, i + 1
        while l >= 0 and r < n and s[l] == s[r]:
            # Same logic as the odd case.
            prev_cuts = cuts[l-1] if l > 0 else -1
            new_cuts = prev_cuts + 1
            cuts[r] = min(cuts[r], new_cuts)
            
            # Expand the window
            l -= 1
            r += 1

    # The final answer is the minimum cuts for the entire string s[0...n-1]
    return cuts[n-1]

```
**Complexity Analysis:**

*   **Time Complexity:** O(n^2). The outer loop runs `n` times. Inside, the two `while` loops also expand outwards. Each palindromic substring is discovered exactly once. Since there can be O(n^2) palindromic substrings in a string, the total time complexity is dominated by the nested expansion, resulting in O(n^2).
*   **Space Complexity:** O(n). We use a DP array of size `n` to store the minimum cuts for each prefix.

---

#### **4. Pattern Connection**
This problem is a quintessential example of a complex problem whose core can be greatly simplified by the **Two Pointers - Expanding From Center** pattern. While the overarching structure is one of Dynamic Programming, the critical sub-problem is to efficiently identify all palindromic substrings.

The key signals in the problem that point to this pattern are:
1.  **The word "Palindrome":** Palindromes are inherently symmetrical around a center. This structural property is perfectly suited for an algorithm that starts at the center and expands.
2.  **Need for all substrings:** The DP formulation requires checking *every* possible suffix `s[j...i]` to see if it's a palindrome. Instead of doing these checks one by one, the "Expanding From Center" approach proactively *finds* all palindromes and uses them to update the DP state. This flips the logic from "checking" to "finding", which is far more efficient.

By iterating through all `2n-1` potential centers, this two-pointer pattern guarantees that we discover every single palindromic substring in O(n^2) time. Integrating this efficient discovery mechanism into the DP framework allows us to solve the problem within the time limits, transforming an exponential or O(n^3) solution into an optimized O(n^2) one.