---
### **844. Backspace String Compare**
**Link to Problem:** [https://leetcode.com/problems/backspace-string-compare/](https://leetcode.com/problems/backspace-string-compare/)

#### **1. Problem Statement**
Given two strings, `s` and `t`, we need to determine if they are equal when typed into an empty text editor. The character `'#'` represents a backspace, which deletes the preceding character. The goal is to return `true` if the final resulting strings are identical, and `false` otherwise.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to simulate the typing process for each string. We can build the final, "processed" version of each string by iterating through them and handling the backspace characters as we encounter them. A stack (or a simple list in Python) is a perfect data structure for this simulation. For each character, if it's a regular letter, we push it onto the stack. If it's a backspace (`#`), we pop the last character from the stack. After processing both strings, we can simply compare the two final resulting strings.

**Python Code:**
```python
def backspaceCompare_brute_force(s: str, t: str) -> bool:
    """
    Compares two strings after applying backspace operations by building
    the final strings first.
    """

    def build_string(input_str: str) -> str:
        """Helper function to process a string and return the final result."""
        # Use a list as a stack to build the final string.
        stack = []
        for char in input_str:
            if char != '#':
                # If it's a normal character, add it to our result.
                stack.append(char)
            elif stack:
                # If it's a backspace and the stack is not empty,
                # pop the last character.
                stack.pop()
        
        # Join the characters in the stack to form the final string.
        return "".join(stack)

    # Build the final versions of both s and t.
    final_s = build_string(s)
    final_t = build_string(t)

    # Return true if the final strings are identical.
    return final_s == final_t

# Example usage:
s = "ab#c"
t = "ad#c"
print(f"Brute Force Result for s='{s}', t='{t}': {backspaceCompare_brute_force(s, t)}") # Output: True

s = "a##c"
t = "#a#c"
print(f"Brute Force Result for s='{s}', t='{t}': {backspaceCompare_brute_force(s, t)}") # Output: True

s = "a#c"
t = "b"
print(f"Brute Force Result for s='{s}', t='{t}': {backspaceCompare_brute_force(s, t)}") # Output: False
```

**Complexity Analysis:**

*   **Time Complexity:** O(M + N), where M and N are the lengths of strings `s` and `t`, respectively. We iterate through each string once to build the final versions.
*   **Space Complexity:** O(M + N). In the worst-case scenario (strings with no backspaces), the stacks will grow to the size of the original strings, requiring extra space proportional to their lengths.

### **3. Optimized Approach: Two Pointers - String Comparison**
**Intuition:**
The brute-force approach is perfectly valid, but it uses extra space to build new strings. We can optimize this to an O(1) space solution using the **Two Pointers** pattern.

The key insight is to compare the strings from right to left. When we iterate backward, a backspace character tells us to *skip* the next valid character we encounter. This is easier to manage than iterating forward, where a backspace modifies a character we have already processed.

We'll set up two pointers, `p1` and `p2`, at the ends of strings `s` and `t`, respectively. We then move them backward, finding the next valid character in each string (i.e., a character that isn't deleted by a backspace). Once we find a valid character from each string, we compare them. If they don't match, the strings are not equal. We continue this process until one or both pointers go past the beginning of their string.

**Example Walkthrough:** `s = "ab#c"`, `t = "ad#c"`
1.  Initialize `p1 = 3` (pointing to `c` in `s`) and `p2 = 3` (pointing to `c` in `t`).
2.  **Comparison 1:**
    *   `s[p1]` is 'c'. It's a valid character.
    *   `t[p2]` is 'c'. It's a valid character.
    *   'c' == 'c'. They match. Decrement pointers: `p1 = 2`, `p2 = 2`.
3.  **Comparison 2:**
    *   **Process `s`:** `s[p1]` is '#'. We see one backspace (`skip_s = 1`). Decrement `p1` to 1. Now `s[p1]` is 'b'. Since `skip_s > 0`, we skip 'b' and decrement `skip_s` to 0. Decrement `p1` to 0. The next valid character in `s` is 'a' at index 0.
    *   **Process `t`:** `t[p2]` is '#'. We see one backspace (`skip_t = 1`). Decrement `p2` to 1. Now `t[p2]` is 'd'. Since `skip_t > 0`, we skip 'd' and decrement `skip_t` to 0. Decrement `p2` to 0. The next valid character in `t` is 'a' at index 0.
    *   **Compare:** The valid characters are `s[0]` ('a') and `t[0]` ('a'). They match. Decrement pointers: `p1 = -1`, `p2 = -1`.
4.  Both pointers are now out of bounds (`< 0`). The loop terminates. Since we never found a mismatch, we return `True`.

**Python Code:**
```python
def backspaceCompare(s: str, t: str) -> bool:
    """
    Compares two strings after applying backspace operations using a
    two-pointer approach for O(1) space complexity.
    """
    # Initialize pointers to the end of the strings.
    p1 = len(s) - 1
    p2 = len(t) - 1

    # Loop as long as there are characters to process in either string.
    while p1 >= 0 or p2 >= 0:
        # Find the next valid character in string 's'.
        skip_s = 0
        while p1 >= 0:
            if s[p1] == '#':
                skip_s += 1
                p1 -= 1 # Move pointer left
            elif skip_s > 0:
                skip_s -= 1 # Use up a skip for this character
                p1 -= 1 # Move pointer left
            else:
                # Found a valid character that is not skipped.
                break
        
        # Find the next valid character in string 't'.
        skip_t = 0
        while p2 >= 0:
            if t[p2] == '#':
                skip_t += 1
                p2 -= 1 # Move pointer left
            elif skip_t > 0:
                skip_t -= 1 # Use up a skip for this character
                p2 -= 1 # Move pointer left
            else:
                # Found a valid character that is not skipped.
                break

        # Now, compare the valid characters.
        
        # Case 1: Both pointers found a valid character.
        if p1 >= 0 and p2 >= 0:
            if s[p1] != t[p2]:
                return False  # Mismatch found.
        # Case 2: One string has remaining characters, the other does not.
        elif p1 >= 0 or p2 >= 0:
            return False # Unequal lengths after backspaces.
        
        # Move pointers inward to continue the comparison.
        p1 -= 1
        p2 -= 1

    # If the loop completes without returning False, the strings are equal.
    return True

# Example usage:
s = "ab#c"
t = "ad#c"
print(f"Optimized Result for s='{s}', t='{t}': {backspaceCompare(s, t)}") # Output: True

s = "a##c"
t = "#a#c"
print(f"Optimized Result for s='{s}', t='{t}': {backspaceCompare(s, t)}") # Output: True

s = "a#c"
t = "b"
print(f"Optimized Result for s='{s}', t='{t}': {backspaceCompare(s, t)}") # Output: False
```

**Complexity Analysis:**

*   **Time Complexity:** O(M + N). Although we have nested `while` loops, each pointer (`p1` and `p2`) only traverses its respective string once from right to left. The total number of operations is proportional to the sum of the lengths of the strings.
*   **Space Complexity:** O(1). We only use a few variables (`p1`, `p2`, `skip_s`, `skip_t`) to keep track of our position and the number of backspaces. We do not create any new data structures, achieving a constant space solution.

### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - String Comparison** pattern. The core task is to check for equivalence between two sequences, but with a twist that makes a direct, linear scan difficult.

The key signal for this pattern is the need to compare two distinct sequences (here, strings `s` and `t`) without allocating extra memory. The backspace character introduces a dependency on future characters (when reading left-to-right) or past characters (when reading right-to-left). By placing pointers at the end of the strings and moving them backward, we transform the problem. A backspace becomes a simple instruction to "skip" a certain number of characters we are about to see. This allows for an in-place comparison, perfectly embodying the efficiency goal of the two-pointer technique: process sequences with minimal space by intelligently coordinating pointers. Whenever a comparison problem involves transformations or non-local dependencies (like a backspace affecting a previous character), consider a two-pointer approach from a non-standard direction (e.g., right-to-left).