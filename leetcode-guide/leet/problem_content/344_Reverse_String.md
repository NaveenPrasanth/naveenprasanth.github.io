---
### **344. Reverse String**
**Link to Problem:** [https://leetcode.com/problems/reverse-string/](https://leetcode.com/problems/reverse-string/)

#### **1. Problem Statement**
The core task is to reverse a string, which is given as an array of characters `s`. The key constraint is that you must modify the input array **in-place** using constant, O(1), extra memory. The function should not return anything; it should directly alter the list it receives.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward idea is to create a new, empty array. We can iterate through the original array from the last element to the first, appending each character to our new array. At this point, the new array contains the reversed sequence of characters. However, the problem requires an *in-place* modification. To satisfy this, we can then iterate through the original array again, replacing each of its elements with the corresponding element from our newly created reversed array.

This approach works, but it temporarily uses extra memory proportional to the size of the input string, which violates the O(1) space constraint.

**Python Code:**
```python
from typing import List

def reverseString_bruteforce(s: List[str]) -> None:
    """
    Reverses a string by creating a copy and then overwriting the original.
    This is NOT an in-place solution with O(1) space.
    """
    # Create a new list containing the reversed characters.
    # We can use Python's slicing feature for a concise way to do this.
    reversed_s = s[::-1]

    # Copy the elements from the new reversed list back into the original list.
    # This loop is necessary to meet the "in-place" modification requirement,
    # even though the overall logic uses O(N) space.
    for i in range(len(s)):
        s[i] = reversed_s[i]

# Example usage:
# my_string = ["h", "e", "l", "l", "o"]
# reverseString_bruteforce(my_string)
# print(my_string) # Output: ['o', 'l', 'l', 'e', 'h']
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Creating the reversed slice `s[::-1]` takes O(N) time. The subsequent loop to copy elements back into `s` also takes O(N) time. This results in a total time complexity of O(N).

*   **Space Complexity: O(N)**
    The primary drawback of this method is its space usage. The slice `s[::-1]` creates a new list that is a full copy of the original string, thus requiring O(N) extra space.

### **3. Optimized Approach: Two Pointers - String Reversal**
**Intuition:**
To solve this problem efficiently and meet the O(1) space constraint, we can use the **Two Pointers** pattern. The idea is to process the string from both ends simultaneously. We'll set up two pointers: a `left` pointer starting at the beginning of the array (index 0) and a `right` pointer starting at the very end (index `len(s) - 1`).

The algorithm proceeds as follows:
1.  While the `left` pointer is to the left of the `right` pointer (`left < right`):
2.  Swap the characters at the `left` and `right` positions.
3.  Move the `left` pointer one step to the right (`left += 1`).
4.  Move the `right` pointer one step to the left (`right -= 1`).

This process continues until the pointers meet or cross each other, at which point the entire array will have been reversed in-place.

Let's walk through an example with `s = ["h", "e", "l", "l", "o"]`:
*   **Initial:** `left = 0` ('h'), `right = 4` ('o').
*   **Swap 1:** Swap `s[0]` and `s[4]`. Array becomes `["o", "e", "l", "l", "h"]`.
    *   Increment `left` to 1, decrement `right` to 3.
*   **Swap 2:** `left = 1` ('e'), `right = 3` ('l'). Swap `s[1]` and `s[3]`. Array becomes `["o", "l", "l", "e", "h"]`.
    *   Increment `left` to 2, decrement `right` to 2.
*   **Stop:** Now `left` is 2 and `right` is 2. The condition `left < right` is false, so the loop terminates. The array is fully reversed.

**Python Code:**
```python
from typing import List

def reverseString(s: List[str]) -> None:
    """
    Reverses a string in-place using the two-pointer technique.
    """
    # Initialize a pointer at the start of the list.
    left = 0
    # Initialize another pointer at the end of the list.
    right = len(s) - 1

    # Loop until the two pointers meet or cross each other.
    while left < right:
        # The core of the pattern: swap the elements at the pointers' positions.
        # Python's tuple assignment makes this a clean, one-line swap.
        s[left], s[right] = s[right], s[left]

        # Move the left pointer forward.
        left += 1
        # Move the right pointer backward.
        right -= 1
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Although we have two pointers, they only make a single pass through the array combined. We perform approximately N/2 swaps. Therefore, the time complexity is linear with respect to the number of elements in the string.

*   **Space Complexity: O(1)**
    This is the key advantage. We are not creating any new data structures. We only use a few variables (`left`, `right`) to store indices, regardless of the input size. This satisfies the problem's requirement for constant extra memory.

### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - String Reversal** pattern. The pattern is immediately signaled by a few key characteristics of the problem:

1.  **Symmetric Operation:** The task requires a symmetric transformation where the first element interacts with the last, the second with the second-to-last, and so on.
2.  **In-Place Requirement:** The constraint to modify the data structure in-place with O(1) extra space strongly suggests an approach that avoids creating copies. Two pointers allow you to rearrange elements within the existing array.
3.  **Sequential Data:** The input is a linear, indexable data structure (an array/list).

Whenever you encounter a problem that involves reversing a sequence or performing symmetric operations from the ends toward the center, the Two Pointers pattern should be your first thought. By placing one pointer at the beginning and one at the end and moving them toward each other, you create a powerful and efficient mechanism for in-place manipulation.