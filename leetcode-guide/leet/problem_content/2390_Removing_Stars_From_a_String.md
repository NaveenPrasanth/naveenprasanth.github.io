---
### **2390. Removing Stars From a String**
**Link to Problem:** [https://leetcode.com/problems/removing-stars-from-a-string/](https://leetcode.com/problems/removing-stars-from-a-string/)

#### **1. Problem Statement**
You are given a string `s` which contains lowercase English letters and stars (`*`). The task is to process the string by removing stars. Each star removes the closest non-star character to its immediate left. The final goal is to return the resulting string after all stars have been processed.

#### **2. Brute Force Approach (Using a Stack)**
**Intuition:**
The most straightforward way to think about this problem is to simulate the process directly. As we iterate through the string, we are essentially building a new, clean string. When we encounter a regular character, we add it to our result. When we see a star, it acts like a "backspace" command, deleting the last character we added.

This "Last-In, First-Out" (LIFO) behavior is a perfect use case for a stack. We can iterate through the input string `s`, character by character:
1. If the character is a letter, we `push` it onto our stack.
2. If the character is a star, we `pop` the last letter from the stack.

After iterating through the entire string, the characters remaining in the stack, when joined together, will form our final string.

**Python Code:**
```python
class Solution:
    def removeStars(self, s: str) -> str:
        # A list in Python can be used as a stack.
        # 'append' is our 'push' operation, and 'pop' is our 'pop' operation.
        char_stack = []
        
        # Iterate through each character in the input string.
        for char in s:
            if char == '*':
                # If it's a star and the stack is not empty, it means there's a character to its left to remove.
                # The 'closest' one is the last one we added, which is at the top of the stack.
                if char_stack:
                    char_stack.pop()
            else:
                # If it's a regular character, add it to our result stack.
                char_stack.append(char)
        
        # The stack now contains all the characters for the final string in the correct order.
        # We join them to form the final output string.
        return "".join(char_stack)

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    This is because we iterate through the input string `s` of length `N` exactly once. The `append` and `pop` operations on a Python list (used as a stack) are, on average, O(1).

*   **Space Complexity: O(N)**
    In the worst-case scenario (a string with no stars), our `char_stack` will grow to hold all `N` characters of the input string. Therefore, the space required is proportional to the input size.

#### **3. Optimized Approach: Two Pointers - String Comparison**
**Intuition:**
While the stack-based approach is efficient in time, it requires extra space. We can optimize the space by using a **Two Pointer** technique, specifically the "slow and fast pointer" variant. This pattern is ideal for problems where you need to produce a "compacted" version of an array or string in-place.

The core idea is to use one pointer to read the string and another to write the result.
1.  **`read_ptr` (Fast Pointer):** This pointer iterates through every character of the original string `s` from left to right. Its job is to inspect each character.
2.  **`write_ptr` (Slow Pointer):** This pointer keeps track of the end of our "valid" result string. It only moves forward when we add a new character to the result.

The process works as follows: we create a character array from the input string (since Python strings are immutable). The `read_ptr` scans this array.
*   When `s[read_ptr]` is a letter, we copy it to the position `s[write_ptr]` and then increment `write_ptr`.
*   When `s[read_ptr]` is a star, it means we need to "delete" the last character we wrote. We accomplish this by simply moving the `write_ptr` back by one.

Let's walk through an example: `s = "le*t"`
`char_array = ['l', 'e', '*', 't']`
`write_ptr = 0`

1.  `read_ptr` sees 'l'. It's a letter.
    *   `char_array[write_ptr]` becomes 'l'. (`char_array` is now `['l', ...]`)
    *   Increment `write_ptr` to `1`.
2.  `read_ptr` sees 'e'. It's a letter.
    *   `char_array[write_ptr]` becomes 'e'. (`char_array` is now `['l', 'e', ...]`)
    *   Increment `write_ptr` to `2`.
3.  `read_ptr` sees '*'. It's a star.
    *   Decrement `write_ptr` to `1`. This effectively "erases" the 'e' we just wrote.
4.  `read_ptr` sees 't'. It's a letter.
    *   `char_array[write_ptr]` becomes 't'. (`char_array` is now `['l', 't', ...]`)
    *   Increment `write_ptr` to `2`.

After the loop, the final string is the content of `char_array` up to the `write_ptr` position, which is `['l', 't']`. Result: "lt".

**Python Code:**
```python
class Solution:
    def removeStars(self, s: str) -> str:
        # Since strings are immutable in Python, we convert the string to a list of characters
        # to perform in-place modifications.
        res_chars = list(s)
        
        # The 'write_ptr' (slow pointer) tracks the position for the next valid character.
        write_ptr = 0
        
        # The 'read_ptr' (fast pointer) iterates through the entire list.
        for read_ptr in range(len(res_chars)):
            # The 'comparison' is checking if the current character is a star or not.
            if res_chars[read_ptr] != '*':
                # If it's a letter, place it at the write_ptr's location.
                res_chars[write_ptr] = res_chars[read_ptr]
                # Move the write pointer forward to accept the next character.
                write_ptr += 1
            else:
                # If it's a star, we effectively "delete" the last written character
                # by moving the write pointer back.
                # We also ensure it doesn't go negative if the string starts with a star.
                if write_ptr > 0:
                    write_ptr -= 1
        
        # The final string is the slice of the list from the beginning up to the write_ptr.
        return "".join(res_chars[:write_ptr])
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    The `read_ptr` traverses the entire string of length `N` exactly once. All operations inside the loop are O(1).

*   **Space Complexity: O(N)**
    In Python, we must create a list of characters from the string, which takes O(N) space. However, the algorithm itself uses constant *auxiliary* space (just two integer pointers). In languages with mutable strings or character arrays (like C++ or Java), this approach would achieve **O(1) auxiliary space complexity**, which is the primary advantage over the stack method.

#### **4. Pattern Connection**
This problem is a classic example of the **Two Pointers (Slow and Fast)** pattern applied to string/array processing. While the pattern name provided was "String Comparison", it's more accurately a "String Modification" or "Compaction" problem.

The key signals for this pattern are:
1.  **Processing a single sequence:** The problem involves iterating through a single array or string.
2.  **Producing a modified/filtered result:** The goal is to remove or change elements to create a "compacted" version of the original sequence.
3.  **In-place potential:** The result is always guaranteed to be shorter than or equal to the original length. This allows the result to be built over the original input's memory space, as the `write_ptr` will never overtake the `read_ptr`.

The "comparison" in this context is the decision made at each step by the fast pointer: "Is this character a star or a letter?". Based on this comparison, the slow pointer either advances (to keep a character) or retreats (to remove one). This technique is fundamental and appears in many other problems, such as "Remove Duplicates from Sorted Array" and "Move Zeroes", where a slow pointer manages the final state of the array while a fast pointer explores it. Recognizing this structure is key to solving a wide range of array manipulation problems efficiently.