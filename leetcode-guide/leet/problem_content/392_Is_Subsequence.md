---
### **392. Is Subsequence**
**Link to Problem:** [https://leetcode.com/problems/is-subsequence/](https://leetcode.com/problems/is-subsequence/)

#### **1. Problem Statement**
Given two strings, `s` and `t`, the task is to determine if `s` is a subsequence of `t`. A subsequence is formed by deleting zero or more characters from the original string (`t`) without changing the relative order of the remaining characters. For example, "ace" is a subsequence of "abcde", but "aec" is not.

#### **2. Brute Force Approach**
**Intuition:**
A straightforward way to think about this is to iterate through the potential subsequence `s` character by character. For each character in `s`, we need to find its first occurrence in `t` *after* the position of the previous character we found. We can maintain a "search-from" index for `t`. If we ever fail to find a character, we know `s` cannot be a subsequence.

The logic is as follows:
1.  Initialize a pointer, `search_from_index`, to 0. This tracks where in `t` we should start our next search.
2.  Iterate through each character `char_s` in string `s`.
3.  For each `char_s`, search for it within string `t`, but only starting from `search_from_index`.
4.  If `char_s` is found at a position `found_pos`, we update `search_from_index` to `found_pos + 1` for the next iteration. This ensures we only look forward in `t`, preserving the relative order.
5.  If `char_s` is not found in the remainder of `t`, it's impossible to form the subsequence. We can immediately return `False`.
6.  If the loop completes, it means every character in `s` was found in `t` in the correct order, so we return `True`.

**Python Code:**
```python
def isSubsequence_brute_force(s: str, t: str) -> bool:
    # This index tracks where our search should begin in the target string 't'.
    search_from_index = 0

    # Iterate through each character of the potential subsequence 's'.
    for char_s in s:
        # str.find(substring, start_index) is a convenient way to implement this logic.
        # It searches for char_s in t, starting from our current search position.
        found_pos = t.find(char_s, search_from_index)

        # If find() returns -1, the character was not found in the rest of string 't'.
        if found_pos == -1:
            return False  # s cannot be a subsequence.
        
        # If the character was found, we must start the search for the *next*
        # character of 's' *after* the current character's position.
        search_from_index = found_pos + 1
    
    # If we successfully exit the loop, all characters of 's' were found in order.
    return True

```
**Complexity Analysis:**

*   **Time Complexity: O(S * T)**, where `S` is the length of `s` and `T` is the length of `t`. In the worst case (e.g., `s = "aaaa"` and `t = "aaaaa"`), for each of the `S` characters in `s`, the `t.find()` method might scan a large portion of `t`.
*   **Space Complexity: O(1)**. We only use a few variables for storage, regardless of the input string sizes.

---
### **3. Optimized Approach: Two Pointers - Fast & Slow (Cycle Detection)**
**Intuition:**
The brute-force approach is inefficient because it may re-scan parts of string `t` repeatedly. We can optimize this by making a single pass through `t`. The key insight is to use two pointers to track our progress through both strings simultaneously. This is a classic application of the Two Pointers pattern.

Let's call our pointers `s_ptr` (for string `s`) and `t_ptr` (for string `t`). Both start at index 0.

1.  `s_ptr` points to the character in `s` we are currently looking for.
2.  `t_ptr` scans through string `t`.

The algorithm works by advancing `t_ptr` through `t` and only advancing `s_ptr` when we find a match. This ensures we check for characters in the correct relative order.

Let's trace `s = "ace"`, `t = "abcde"`:
*   **Initial:** `s_ptr = 0` (points to 'a'), `t_ptr = 0` (points to 'a').
*   **Step 1:** `s[s_ptr]` ('a') == `t[t_ptr]` ('a'). It's a match! We've found the first character of `s`. We advance **both** pointers to look for the next character.
    *   `s_ptr` becomes 1, `t_ptr` becomes 1.
*   **Step 2:** `s[s_ptr]` ('c') != `t[t_ptr]` ('b'). No match. We haven't found the 'c' we're looking for yet. We advance only `t_ptr` to continue scanning `t`.
    *   `s_ptr` stays 1, `t_ptr` becomes 2.
*   **Step 3:** `s[s_ptr]` ('c') == `t[t_ptr]` ('c'). A match! We advance **both**.
    *   `s_ptr` becomes 2, `t_ptr` becomes 3.
*   **Step 4:** `s[s_ptr]` ('e') != `t[t_ptr]` ('d'). No match. Advance only `t_ptr`.
    *   `s_ptr` stays 2, `t_ptr` becomes 4.
*   **Step 5:** `s[s_ptr]` ('e') == `t[t_ptr]` ('e'). A match! Advance **both**.
    *   `s_ptr` becomes 3, `t_ptr` becomes 5.

The loop terminates when one of the pointers goes out of bounds. The final check is key: if `s_ptr` has successfully reached the end of `s` (i.e., `s_ptr == len(s)`), it means every character of `s` was found in order.

**Python Code:**
```python
def isSubsequence_optimized(s: str, t: str) -> bool:
    # s_ptr tracks our progress in the subsequence 's'.
    # t_ptr tracks our progress in the main string 't'.
    s_ptr, t_ptr = 0, 0

    # We continue as long as both pointers are within the bounds of their respective strings.
    while s_ptr < len(s) and t_ptr < len(t):
        # If the characters match, it means we've found the character s[s_ptr] in 't'.
        # We can now look for the *next* character in 's'.
        if s[s_ptr] == t[t_ptr]:
            s_ptr += 1  # Move the 'slow' pointer only on a match.
        
        # We always advance t_ptr to scan through the main string.
        # This is the 'fast' pointer that moves unconditionally.
        t_ptr += 1
    
    # After the loop, if s_ptr has reached the length of s,
    # it means all characters of s were found in order.
    return s_ptr == len(s)

```
**Complexity Analysis:**

*   **Time Complexity: O(T)**, where `T` is the length of `t`. We traverse the string `t` with `t_ptr` exactly once. The `s_ptr` only moves forward and does not add to the overall complexity. This is a significant improvement over O(S * T).
*   **Space Complexity: O(1)**. We only use two integer variables for the pointers.

---
### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers** pattern. While it's not the "Fast & Slow" variant typically used for cycle detection in a single data structure, it perfectly demonstrates the power of using two pointers to process sequences in lockstep.

The key characteristics that signal the Two Pointers pattern here are:
1.  **Comparison between two sequences:** We need to compare characters from `s` and `t`.
2.  **Order matters:** The problem requires maintaining the relative order of characters, making a simple frequency count (like with a hash map) insufficient.
3.  **Linear scan:** The problem can be solved by iterating through the strings without complex nested structures.

The two pointers, `s_ptr` and `t_ptr`, efficiently manage state: `s_ptr` represents the "requirement" (which character we are looking for), and `t_ptr` represents the "progress" (where we are in our search). One pointer (`t_ptr`) moves steadily forward, while the other (`s_ptr`) moves conditionally. This "different rate of movement" is the core principle that connects this problem to the broader family of Two Pointer algorithms, allowing us to solve it elegantly in a single, linear pass.