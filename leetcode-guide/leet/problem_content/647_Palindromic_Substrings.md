---
### **647. Palindromic Substrings**
**Link to Problem:** [https://leetcode.com/problems/palindromic-substrings/](https://leetcode.com/problems/palindromic-substrings/)

#### **1. Problem Statement**
Given a string `s`, the task is to count the total number of palindromic substrings it contains. A substring is a contiguous sequence of characters, and a palindrome reads the same forwards and backward. Substrings with different start or end indices are counted as distinct even if they consist of the same characters.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to generate every possible substring of `s`, and for each one, check if it is a palindrome. We can generate all substrings using two nested loops: the outer loop `i` will determine the starting index and the inner loop `j` will determine the ending index. A simple helper check, like comparing a substring to its reverse, can validate if it's a palindrome.

**Python Code:**
```python
class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        count = 0

        # Step 1: Iterate through all possible starting points of a substring.
        for i in range(n):
            # Step 2: Iterate through all possible ending points for the given start.
            for j in range(i, n):
                # Step 3: Extract the substring from index i to j (inclusive).
                substring = s[i : j + 1]
                
                # Step 4: Check if the extracted substring is a palindrome.
                # The `[::-1]` slice notation is a concise way to reverse a string in Python.
                if substring == substring[::-1]:
                    count += 1
        
        return count

```
**Complexity Analysis:**

*   **Time Complexity: O(N³)**
    This is due to three nested levels of work. The two nested loops (`i` and `j`) give us O(N²) iterations for generating all substrings. Inside the inner loop, creating the substring slice `s[i:j+1]` and then reversing it `substring[::-1]` both take time proportional to the length of the substring, which can be up to O(N). This results in a total complexity of O(N² * N) = O(N³).

*   **Space Complexity: O(N)**
    In each iteration of the inner loop, a new `substring` is created. In the worst case, this substring can have a length of N, so the space required for this temporary variable is O(N).

---
### **3. Optimized Approach: Two Pointers - Expanding From Center**
**Intuition:**
The brute-force approach is slow because it re-evaluates the same characters many times within different substrings. A more efficient strategy is to flip the logic: instead of generating a substring and *then* checking if it's a palindrome, we can pick a potential *center* of a palindrome and expand outwards to find all palindromes centered there.

A palindrome is symmetric around its center. This center can be a single character (for odd-length palindromes like "r-a-c-e-c-a-r") or the space between two identical characters (for even-length palindromes like "a-b-b-a"). For a string of length N, there are `2N - 1` such potential centers: `N` single-character centers and `N - 1` in-between centers.

We can iterate through all `2N - 1` potential centers. For each center, we use two pointers, `left` and `right`, and expand them outwards as long as they are within the string's bounds and the characters they point to are equal. Each time they match, we've found another valid palindrome.

**Example Walkthrough:** `s = "aba"`
1.  **Center at `i=0` ('a'):**
    *   **Odd Case:** `left=0`, `right=0`. `s[0]==s[0]`. Found "a". `count=1`. Pointers move to `left=-1`, `right=1`. Out of bounds. Stop.
2.  **Center between `i=0` and `i=1`:**
    *   **Even Case:** `left=0`, `right=1`. `s[0]!='b'`. No palindrome here. Stop.
3.  **Center at `i=1` ('b'):**
    *   **Odd Case:** `left=1`, `right=1`. `s[1]==s[1]`. Found "b". `count=2`. Pointers move to `left=0`, `right=2`. `s[0]==s[2]`. Found "aba". `count=3`. Pointers move to `left=-1`, `right=3`. Out of bounds. Stop.
4.  **Center between `i=1` and `i=2`:**
    *   **Even Case:** `left=1`, `right=2`. `s[1]!='a'`. No palindrome here. Stop.
5.  **Center at `i=2` ('a'):**
    *   **Odd Case:** `left=2`, `right=2`. `s[2]==s[2]`. Found "a". `count=4`. Pointers move to `left=1`, `right=3`. Out of bounds. Stop.

Final `count` is 4. The palindromes are "a", "b", "a", "aba".

**Python Code:**
```python
class Solution:
    def countSubstrings(self, s: str) -> int:
        n = len(s)
        self.count = 0

        # Helper function to perform the expansion and count palindromes
        def expand_from_center(left, right):
            # The core of the pattern: two pointers expand outwards
            while left >= 0 and right < n and s[left] == s[right]:
                # Each time the characters match, we've found a new valid palindrome.
                self.count += 1
                
                # Move pointers outwards to check for a larger palindrome
                left -= 1
                right += 1

        # Main loop to iterate through all possible centers
        for i in range(n):
            # Case 1: Odd-length palindromes, centered at a single character 'i'
            # e.g., for "racecar", the center is 'e'
            expand_from_center(i, i)
            
            # Case 2: Even-length palindromes, centered between two characters 'i' and 'i+1'
            # e.g., for "aabbaa", the center is between the two 'b's
            expand_from_center(i, i + 1)
            
        return self.count

```
**Complexity Analysis:**

*   **Time Complexity: O(N²)**
    We iterate through the string with a single loop of length `N`. For each index `i`, we call `expand_from_center` twice. In the worst-case scenario (e.g., a string like "aaaaa"), each expansion can take up to O(N) time. Therefore, the total time complexity is `N * O(N) = O(N²)`.

*   **Space Complexity: O(1)**
    This algorithm is very space-efficient. We only use a few variables (`left`, `right`, `count`, `i`) to keep track of our state, regardless of the input string's size. No auxiliary data structures are needed.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Expanding From Center** pattern. The defining characteristic that signals this pattern is the task of finding or counting **palindromes**.

A palindrome's inherent symmetry is the key. The brute-force approach ignores this symmetry, leading to redundant work. The "Expanding From Center" approach leverages this property directly. By fixing a center and using two pointers (`left` and `right`) that move in opposite directions, we efficiently verify and count all palindromes associated with that center.

You should think of this pattern whenever a problem involves:
1.  Identifying palindromic substrings.
2.  Finding the longest palindromic substring.
3.  Any problem structure that exhibits symmetry around a central point.

The two pointers moving away from each other is the mechanical signature of this pattern, distinguishing it from other two-pointer patterns where pointers might move towards each other or in the same direction.