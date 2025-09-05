---
### **443. String Compression**
**Link to Problem:** [https://leetcode.com/problems/string-compression/](https://leetcode.com/problems/string-compression/)

#### **1. Problem Statement**
Given an array of characters `chars`, compress it in-place. The compression logic is to replace consecutive repeating characters with the character itself followed by its count. If a group's length is 1, the number '1' should not be appended. The function must return the new length of the compressed array.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward idea is to ignore the "in-place" constraint initially to simplify the logic. We can build the compressed result in a separate data structure (like a list of characters or a string builder). After processing the entire input array, we can then copy this new, compressed result back into the beginning of the original `chars` array. This separates the logic of compression from the complexity of in-place modification.

**Python Code:**
```python
def compress_brute_force(chars: list[str]) -> int:
    # This approach is not truly in-place and uses O(N) extra space.
    if not chars:
        return 0

    # Use an auxiliary list to build the compressed result.
    compressed_result = []
    
    i = 0
    n = len(chars)
    while i < n:
        current_char = chars[i]
        count = 0
        
        # Count consecutive occurrences of the current character.
        j = i
        while j < n and chars[j] == current_char:
            count += 1
            j += 1
        
        # Append the character to our result.
        compressed_result.append(current_char)
        
        # If the count is greater than 1, append the digits of the count.
        if count > 1:
            for digit in str(count):
                compressed_result.append(digit)
        
        # Move the main pointer to the start of the next new character.
        i = j
        
    # Now, copy the compressed result back into the original `chars` array.
    for i in range(len(compressed_result)):
        chars[i] = compressed_result[i]
    
    # The new length is the length of our auxiliary list.
    return len(compressed_result)

# Example Usage:
# chars = ["a","a","b","b","c","c","c"]
# new_length = compress_brute_force(chars)
# print(new_length)  # Output: 6
# print(chars[:new_length]) # Output: ['a', '2', 'b', '2', 'c', '3']
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    The `while` loop iterates through the input `chars` array once to build the `compressed_result`, which takes O(N) time. The final `for` loop to copy the result back into `chars` also takes O(N) in the worst case. Therefore, the total time complexity is O(N) + O(N) = O(N).

*   **Space Complexity: O(N)**
    This is the main drawback. We use an auxiliary list, `compressed_result`, which in the worst-case scenario (e.g., `["a","b","c"]`) could grow to be the same size as the input array. This violates the problem's O(1) space constraint.

### **3. Optimized Approach: Pattern 4: Two Pointers - In-place Array Modification**
**Intuition:**
To solve this in-place, we need a way to overwrite the input array `chars` without losing information we still need to read. This is a perfect scenario for a "read/write" two-pointer approach.

We'll use two pointers:
1.  A `read` pointer (`i` in the code) that scans through the original array.
2.  A `write` pointer (`write_idx`) that marks the position in the array where the next piece of compressed information (a character or a digit) should be written.

The `read` pointer will always be ahead of or at the same position as the `write` pointer. The `read` pointer's job is to find the boundaries of a group of consecutive characters. Once a group is identified (e.g., "a", "a", "a"), the `write` pointer writes the character ('a') and its count ('3') to the front of the array. This process overwrites the old data, which is safe because the `read` pointer has already scanned past it.

Let's walk through `chars = ["a", "a", "b", "b", "c", "c", "c"]`:

1.  Initialize `read = 0` and `write_idx = 0`.
2.  **Group 'a':** The `read` pointer scans forward and finds two 'a's.
    *   Write the character: `chars[write_idx] = 'a'`. `write_idx` is now 1.
    *   Count is 2. Convert '2' to a character and write it: `chars[write_idx] = '2'`. `write_idx` is now 2.
    *   `chars` is now `["a", "2", "b", "b", "c", "c", "c"]`.
3.  **Group 'b':** The `read` pointer is now at the first 'b' (index 2). It scans forward and finds two 'b's.
    *   Write the character: `chars[write_idx] = 'b'`. `write_idx` is now 3.
    *   Count is 2. Write '2': `chars[write_idx] = '2'`. `write_idx` is now 4.
    *   `chars` is now `["a", "2", "b", "2", "c", "c", "c"]`.
4.  **Group 'c':** The `read` pointer is now at the first 'c' (index 4). It scans forward and finds three 'c's.
    *   Write the character: `chars[write_idx] = 'c'`. `write_idx` is now 5.
    *   Count is 3. Write '3': `chars[write_idx] = '3'`. `write_idx` is now 6.
    *   `chars` is now `["a", "2", "b", "2", "c", "3", "c"]`.
5.  The `read` pointer reaches the end. The final value of `write_idx` (6) is the new length.

**Python Code:**
```python
def compress(chars: list[str]) -> int:
    # write_idx is our slow "write" pointer.
    # It tracks the end of the compressed section of the array.
    write_idx = 0
    
    # read_ptr is our fast "read" pointer.
    # It scans the original array.
    read_ptr = 0
    n = len(chars)

    while read_ptr < n:
        current_char = chars[read_ptr]
        count = 0
        
        # Use a separate pointer to find the end of the current group of characters.
        group_end_ptr = read_ptr
        while group_end_ptr < n and chars[group_end_ptr] == current_char:
            count += 1
            group_end_ptr += 1
            
        # --- Perform the In-place Write ---
        # 1. Write the character itself.
        chars[write_idx] = current_char
        write_idx += 1
        
        # 2. If the count is > 1, write the digits of the count.
        if count > 1:
            for digit in str(count):
                chars[write_idx] = digit
                write_idx += 1
        
        # Move the read pointer to the start of the next group.
        read_ptr = group_end_ptr
        
    # The final position of the write_idx is the new length of the array.
    return write_idx

# Example Usage:
# chars = ["a","a","b","b","c","c","c"]
# new_length = compress(chars)
# print(new_length)  # Output: 6
# print(chars[:new_length]) # Output: ['a', '2', 'b', '2', 'c', '3']
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Although we have a nested `while` loop, this is a single-pass solution. The outer `read_ptr` and the inner `group_end_ptr` together ensure that each character in the `chars` array is visited exactly once. Therefore, the time complexity is linear.

*   **Space Complexity: O(1)**
    This is the key improvement. We modify the array in-place and only use a few variables (`write_idx`, `read_ptr`, `count`, etc.) for tracking. The space required does not depend on the size of the input array.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern. The pattern is signaled by two key constraints:
1.  The modification must happen **in-place**.
2.  The result of the modification is guaranteed to be **shorter than or equal to** the original array length.

These constraints create a scenario where you can safely overwrite the beginning of the array while reading from a point further ahead. The "write" pointer (`write_idx`) constructs the new, valid array at the front, while the "read" pointer (`read_ptr`) explores the yet-unprocessed part of the original array. This separation of reading and writing duties is the core concept of the pattern, allowing for efficient O(1) space solutions to problems that would otherwise seem to require extra memory. Problems like "Remove Duplicates from Sorted Array" (LeetCode 26) and "Move Zeroes" (LeetCode 283) follow this exact same structural logic.