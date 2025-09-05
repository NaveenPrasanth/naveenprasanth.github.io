---
### **131. Palindrome Partitioning**
**Link to Problem:** [https://leetcode.com/problems/palindrome-partitioning/](https://leetcode.com/problems/palindrome-partitioning/)

#### **1. Problem Statement**
Given a string `s`, the task is to partition it into one or more substrings such that every substring in the partition is a palindrome. The goal is to return all possible palindrome partitionings of `s`.

For example, if the input is `s = "aab"`, the output should be `[["a","a","b"],["aa","b"]]`, as these are the only two ways to split the string into palindromic parts.

#### **2. Brute Force Approach**
**Intuition:**
A true brute-force approach would be to first generate every single possible way to partition the string, without any regard for whether the parts are palindromes. For a string of length `N`, there are `2^(N-1)` possible partitions. After generating a complete partition (e.g., `["a", "ab"]` for the string `"aab"`), we would then iterate through its parts and verify if each one is a palindrome. If all parts are palindromes, we add this partition to our results.

This approach is highly inefficient because we waste time generating and then checking many invalid partitions. For instance, once we generate the partition `["a", "ab"]`, we check "ab" and find it's not a palindrome, invalidating the entire partition. A smarter method would avoid exploring this path in the first place. Due to its complexity and inefficiency, coding this exact approach is not practical. We will instead focus on a refined recursive method.

**Complexity Analysis:**

*   **Time Complexity:** `O(N * 2^N)`. The number of partitions is exponential. For each partition, we check every substring, leading to a very high time complexity.
*   **Space Complexity:** `O(N * 2^N)`. Storing all possible partitions before filtering would require exponential space.

---

### **3. Optimized Approach: Backtracking with Efficient Palindrome Checking**
**Intuition:**
Instead of generating all partitions and then checking them, we can build a valid partition step-by-step and stop exploring a path as soon as it violates the palindrome condition. This "build and prune" strategy is the essence of **Backtracking**.

We can think of this as a depth-first search (DFS) through the decision tree of all possible partitions.

1.  Start at the beginning of the string (index 0).
2.  Iterate forward from the current starting position, creating substrings. For each substring, check if it's a palindrome.
3.  If the substring `s[start:i+1]` *is* a palindrome, we consider it a valid first piece of our current partition. We add it to our `current_path` and then recursively call our function on the *rest* of the string (starting from `i+1`).
4.  After the recursive call returns (meaning it has explored all possibilities from that point), we **backtrack**. We remove the substring we just added from `current_path`. This allows us to explore other options, such as creating a longer palindromic substring from the original `start` position.
5.  The base case for our recursion is when our starting position has reached the end of the string. This means we have successfully found a complete, valid partition, which we add to our final results.

For the crucial sub-problem of checking if a string is a palindrome, we can use a simple and efficient **two-pointer** technique. One pointer starts at the beginning of the substring, and the other at the end. They move inward, and if they ever point to characters that don't match, we know it's not a palindrome.

**Walkthrough with `s = "aab"`:**
- `dfs(start=0, path=[])`
  - `i=0`: Substring `s[0:1]` is "a". It's a palindrome.
    - Add "a" to path. `path = ["a"]`.
    - Recurse: `dfs(start=1, path=["a"])`.
      - `i=1`: Substring `s[1:2]` is "a". It's a palindrome.
        - Add "a" to path. `path = ["a", "a"]`.
        - Recurse: `dfs(start=2, path=["a", "a"])`.
          - `i=2`: Substring `s[2:3]` is "b". It's a palindrome.
            - Add "b" to path. `path = ["a", "a", "b"]`.
            - Recurse: `dfs(start=3, path=["a", "a", "b"])`.
              - Base Case: `start == len(s)`. Add `["a", "a", "b"]` to results.
              - Return.
            - Backtrack: remove "b". `path = ["a", "a"]`.
          - Loop finishes. Return.
      - Backtrack: remove "a". `path = ["a"]`.
      - `i=2`: Substring `s[1:3]` is "ab". Not a palindrome. Continue.
      - Loop finishes. Return.
    - Backtrack: remove "a". `path = []`.
  - `i=1`: Substring `s[0:2]` is "aa". It's a palindrome.
    - Add "aa" to path. `path = ["aa"]`.
    - Recurse: `dfs(start=2, path=["aa"])`.
      - `i=2`: Substring `s[2:3]` is "b". It's a palindrome.
        - Add "b" to path. `path = ["aa", "b"]`.
        - Recurse: `dfs(start=3, path=["aa", "b"])`.
          - Base Case: `start == len(s)`. Add `["aa", "b"]` to results.
          - Return.
        - Backtrack: remove "b". `path = ["aa"]`.
      - Loop finishes. Return.
    - Backtrack: remove "aa". `path = []`.
  - `i=2`: Substring `s[0:3]` is "aab". Not a palindrome. Continue.
- Final results: `[["a", "a", "b"], ["aa", "b"]]`.

**Python Code:**
```python
from typing import List

class Solution:
    def partition(self, s: str) -> List[List[str]]:
        results = []
        current_path = []

        def is_palindrome(sub: str) -> bool:
            # This helper function uses a classic two-pointer check (moving inwards).
            left, right = 0, len(sub) - 1
            while left < right:
                if sub[left] != sub[right]:
                    return False
                # Pointers move inward
                left += 1
                right -= 1
            return True

        def dfs(start_index: int):
            # Base case: If we've reached the end of the string, we have found a valid partition.
            if start_index >= len(s):
                # We add a copy of current_path, not the reference itself.
                results.append(list(current_path))
                return

            # Explore all possible substrings starting from start_index
            for i in range(start_index, len(s)):
                substring = s[start_index : i + 1]
                
                # If the substring is a palindrome, we can explore this path further.
                if is_palindrome(substring):
                    # 1. Choose: Add the palindrome to our current path.
                    current_path.append(substring)
                    
                    # 2. Explore: Recurse on the rest of the string.
                    dfs(i + 1)
                    
                    # 3. Unchoose (Backtrack): Remove the last-added palindrome to explore other possibilities.
                    current_path.pop()

        # Start the backtracking process from the beginning of the string.
        dfs(0)
        return results

```

**Complexity Analysis:**

*   **Time Complexity:** `O(N * 2^N)`. In the worst-case scenario (e.g., a string `s = "aaaaa"`), every possible substring is a palindrome. There are `2^(N-1)` ways to partition the string. For each valid partition, we perform O(N) work to build the path and check for palindromes.
*   **Space Complexity:** `O(N)`. The primary space usage comes from the recursion stack. In the worst case (a partition of N single-character palindromes), the recursion depth will be `N`. The `current_path` also stores substrings, which can take up to O(N) space.

---
### **4. Pattern Connection**
This problem is a quintessential example of **Backtracking**, a general algorithmic technique for finding all (or some) solutions to a computational problem by incrementally building candidates and abandoning a candidate ("backtracking") as soon as it's determined that it cannot possibly be completed to a valid solution.

However, the efficiency of this backtracking algorithm hinges on a fast sub-routine: verifying if a given substring is a palindrome. This is where the **Two Pointers** pattern becomes essential. The `is_palindrome` helper function is a perfect, clean implementation of this pattern.

It's important to distinguish between two common two-pointer palindrome techniques:
1.  **Two Pointers Moving Inward (used here):** Ideal for *verifying* if a *known* substring is a palindrome. You start with pointers at both ends and move them toward the center.
2.  **Two Pointers Expanding From Center (the pattern name):** Ideal for *finding or counting all* palindromic substrings within a larger string. You iterate through each character as a potential center and expand two pointers *outward*.

While the main algorithm is Backtracking, it relies on the Two Pointers pattern as a critical building block. This problem demonstrates how fundamental patterns are often composed to solve more complex problems. Recognizing that the repeated "is this a palindrome?" check could be optimized with two pointers is a key insight for an efficient solution.