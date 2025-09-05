Here is the detailed, educational entry for the "Longest Palindromic Substring" problem, formatted for your algorithms study guide.

---

### **5. Longest Palindromic Substring**
**Link to Problem:** [https://leetcode.com/problems/longest-palindromic-substring/](https://leetcode.com/problems/longest-palindromic-substring/)

#### **1. Problem Statement**
Given a string `s`, the task is to find and return the longest substring within `s` that is also a palindrome. A palindrome is a sequence that reads the same backward as forward.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to check every possible substring of `s`. We can generate all substrings, check if each one is a palindrome, and keep track of the longest one we've found so far.

The logic is as follows:
1.  Use a loop with index `i` to determine the starting character of a potential substring.
2.  Use a nested loop with index `j` to determine the ending character.
3.  For each substring from `i` to `j`, create a helper function to verify if it's a palindrome.
4.  Maintain two variables, one for the maximum length found and one for the longest palindrome string itself. Update them whenever a longer palindrome is discovered.

**Python Code:**
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        
        def is_palindrome(sub: str) -> bool:
            # A simple way to check for a palindrome is to see if the
            # string is equal to its reverse.
            return sub == sub[::-1]

        n = len(s)
        if n < 2:
            return s
            
        max_len = 1
        longest_pal = s[0]

        # First loop sets the starting point of the substring.
        for i in range(n):
            # Second loop sets the ending point.
            for j in range(i, n):
                substring = s[i:j+1]
                # If we find a new palindrome that is longer than our current max...
                if len(substring) > max_len and is_palindrome(substring):
                    max_len = len(substring)
                    longest_pal = substring
                    
        return longest_pal

```
**Complexity Analysis:**

*   **Time Complexity: O(n³)**
    We have two nested loops to generate all substrings, which takes O(n²) time. For each of these O(n²) substrings, we call `is_palindrome`. In the worst case, checking a substring of length `k` takes O(k) time (due to slicing and comparison). Since `k` can be up to `n`, the total complexity is O(n² * n) = O(n³).

*   **Space Complexity: O(n)**
    The space complexity is dominated by the slicing operation `s[i:j+1]`, which can create a new string of up to length `n`.

#### **3. Optimized Approach: Two Pointers - Expanding From Center**
**Intuition:**
The brute-force method is inefficient because it repeatedly checks overlapping substrings. A more clever approach is to realize that every palindrome has a center. This center can either be a single character (for odd-length palindromes like "r-a-c-e-c-a-r") or the space between two identical characters (for even-length palindromes like "a-b-b-a").

Instead of checking every substring, we can iterate through every possible center and expand outwards with two pointers to find the longest palindrome centered there. There are `n` possible single-character centers and `n-1` possible two-character centers, for a total of `2n - 1` potential centers.

Let's walk through `s = "babad"`:
1.  **Center at `i = 0` ('b'):**
    *   Odd case: `(left=0, right=0)`. `s[0] == s[0]`. Palindrome is "b". Can't expand further.
2.  **Center at `i = 1` ('a'):**
    *   Odd case: `(left=1, right=1)`. Palindrome is "a". Expand outwards: `left=0, right=2`. `s[0]` ('b') == `s[2]` ('b'). It's a match! The palindrome is now "bab". Expand again: `left=-1, right=3`. Pointers are out of bounds. The longest palindrome from this center is "bab".
    *   Even case: `(left=1, right=2)`. `s[1]` ('a') != `s[2]` ('b'). No even palindrome here.
3.  **Center at `i = 2` ('b'):**
    *   Odd case: `(left=2, right=2)`. Palindrome is "b". Expand: `left=1, right=3`. `s[1]` ('a') == `s[3]` ('a'). Match! Palindrome is "aba".
    *   ... and so on.

We keep track of the longest palindrome found across all center expansions.

**Python Code:**
```python
class Solution:
    def longestPalindrome(self, s: str) -> str:
        if not s or len(s) < 1:
            return ""

        # We'll store the start and end indices of the longest palindrome found so far.
        start = 0
        end = 0

        # Iterate through each character of the string to treat it as a potential center.
        for i in range(len(s)):
            # Case 1: Odd length palindrome (e.g., "racecar")
            # The center is the character at index `i`.
            len1 = self.expand_from_center(s, i, i)
            
            # Case 2: Even length palindrome (e.g., "aabbaa")
            # The center is between the characters at `i` and `i+1`.
            len2 = self.expand_from_center(s, i, i + 1)
            
            # Find the maximum length from the two cases.
            max_len = max(len1, len2)
            
            # If we found a new longest palindrome, update our start and end indices.
            if max_len > (end - start):
                # We calculate the start index from the center and the length.
                start = i - (max_len - 1) // 2
                end = i + max_len // 2

        # Return the longest palindromic substring using the final start and end indices.
        return s[start : end + 1]

    def expand_from_center(self, s: str, left: int, right: int) -> int:
        # These two pointers start at the center and expand outwards.
        while left >= 0 and right < len(s) and s[left] == s[right]:
            left -= 1
            right += 1
        
        # The length of the palindrome is right - left - 1.
        # Why -1? Because after the loop ends, `left` and `right` are one
        # position _beyond_ the boundaries of the palindrome.
        return right - left - 1
```
**Complexity Analysis:**

*   **Time Complexity: O(n²)**
    The main loop iterates through `n` characters. For each character, the `expand_from_center` function can, in the worst-case scenario (a string of all identical characters), expand `n/2` times. This results in a time complexity of O(n * n) = O(n²), a significant improvement over the O(n³) brute-force approach.

*   **Space Complexity: O(1)**
    We are not using any extra data structures that scale with the input size. We only use a few variables (`start`, `end`, `left`, `right`, etc.) to keep track of indices, resulting in constant space.

#### **4. Pattern Connection**
This problem is a classic example of the **Two Pointers - Expanding From Center** pattern. The key signal for this pattern is the search for a **symmetrical** or **palindromic** property within a sequence.

Instead of the brute-force method of generating all substrings and then checking their properties, this pattern reframes the problem by focusing on the core property itself—the center of the palindrome. By iterating through all possible centers and using two pointers (`left` and `right`) to expand outwards, we systematically and efficiently check only for valid palindromes.

This approach is fundamentally more efficient because it avoids redundant checks. Each character pair is compared only once per center expansion. This pattern beautifully leverages the inherent symmetry of palindromes, turning a potential O(n³) problem into a much more manageable O(n²) solution with O(1) space, making it a powerful tool for your algorithmic arsenal.