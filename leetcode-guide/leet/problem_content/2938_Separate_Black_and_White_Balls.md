---
### **2938. Separate Black and White Balls**
**Link to Problem:** [https://leetcode.com/problems/separate-black-and-white-balls/](https://leetcode.com/problems/separate-black-and-white-balls/)

#### **1. Problem Statement**
Given a binary string `s` representing a row of balls where '0' is a white ball and '1' is a black ball, we need to find the minimum number of swaps between *adjacent* balls to group all white balls on the left and all black balls on the right.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to think about this is to consider the final, desired state. In the end, all '0's will be on the left, and all '1's on the right. This means that every black ball ('1') must eventually move to the right of every white ball ('0').

The number of swaps for a single ball to move past another is one. Therefore, for any given black ball, the number of swaps it must perform is equal to the number of white balls currently to its right. By summing this value for every black ball in the string, we can find the total minimum swaps.

The brute-force logic is as follows:
1. Initialize a `total_swaps` counter to zero.
2. Iterate through the string from left to right with a pointer `i`.
3. If we find a black ball (`s[i] == '1'`):
    a. We know this ball must move past all white balls to its right.
    b. Start a second, nested loop with a pointer `j` from `i + 1` to the end of the string.
    c. For each white ball we find (`s[j] == '0'`), increment `total_swaps`.
4. After the loops complete, `total_swaps` will hold the minimum number of swaps.

**Python Code:**
```python
class Solution:
    def minimumSteps(self, s: str) -> int:
        """
        Brute-force solution to calculate minimum swaps.
        
        For each black ball ('1'), we count how many white balls ('0')
        appear to its right. Each such white ball represents one
        adjacent swap that the black ball must eventually make.
        """
        n = len(s)
        total_swaps = 0
        
        # Outer loop to find each black ball ('1')
        for i in range(n):
            if s[i] == '1':
                # Inner loop to count white balls ('0') to the right
                for j in range(i + 1, n):
                    if s[j] == '0':
                        # This '1' at index i must be swapped past the '0' at index j
                        total_swaps += 1
                        
        return total_swaps

```
**Complexity Analysis:**

*   **Time Complexity: O(n²)**
    This is due to the nested loops. In the worst-case scenario (a string like "111...000..."), the outer loop runs `n/2` times, and the inner loop also runs approximately `n/2` times for each of those, leading to a quadratic time complexity.

*   **Space Complexity: O(1)**
    We only use a few variables (`n`, `total_swaps`, `i`, `j`) for storage, which does not depend on the input size.

### **3. Optimized Approach: Two Pointers - In-place Array Modification**
**Intuition:**
The brute-force O(n²) approach is inefficient because for every black ball, we rescan a large portion of the string. We can optimize this by realizing we are essentially trying to partition the string into a `[whites, blacks]` configuration. This partitioning task is a classic signal for the **Two Pointers** pattern, specifically with pointers starting at opposite ends.

Let's set up two pointers: `left` starting at index 0 and `right` starting at the last index.
- The `left` pointer's job is to scan forward and find the first "out-of-place" black ball (`1`). An ideal left section should only contain white balls (`0`).
- The `right` pointer's job is to scan backward and find the first "out-of-place" white ball (`0`). An ideal right section should only contain black balls (`1`).

When `left` finds a `1` and `right` finds a `0` (and `left < right`), we've identified a pair that needs to be swapped. The crucial insight is calculating the swap cost. To move the white ball from `right` to the `left` position requires `right - left` adjacent swaps. After accounting for this cost, we can conceptually consider them swapped and move both pointers inward to find the next misplaced pair.

Let's walk through an example: `s = "10110"`
1.  Initialize `left = 0`, `right = 4`, `swaps = 0`.
2.  `s[left]` is '1' (misplaced) and `s[right]` is '0' (misplaced).
3.  We've found a pair to swap. The cost to move the '0' at index 4 to the '1's spot at index 0 is `right - left = 4 - 0 = 4`.
4.  Add this cost: `swaps = 4`.
5.  Move pointers inward: `left` becomes 1, `right` becomes 3.
6.  Now, `s[left]` is '0'. This is a white ball where it should be. The `left` pointer's job is done for this position. Increment `left` to 2.
7.  `s[left]` is now '1' (misplaced). `s[right]` is '1'. A black ball on the right is fine. Decrement `right` to 2.
8.  Now `left = 2` and `right = 2`. The condition `left < right` is no longer true, so the loop terminates.
9.  The final result is `4`.

This approach ensures that each element is visited only once by either the `left` or `right` pointer, leading to a linear time solution.

**Python Code:**
```python
class Solution:
    def minimumSteps(self, s: str) -> int:
        """
        Optimized solution using the Two Pointers pattern.
        
        We use two pointers, one at each end, to find misplaced balls.
        `left` seeks a black ball ('1') from the start.
        `right` seeks a white ball ('0') from the end.
        
        When a misplaced pair is found, we calculate the distance between them,
        which represents the number of adjacent swaps needed to move the
        white ball to the left pointer's position.
        """
        left, right = 0, len(s) - 1
        swaps = 0
        
        # Pointers move towards each other until they cross
        while left < right:
            # Find the first black ball from the left that is out of place
            if s[left] == '0':
                left += 1
                continue
            
            # Find the first white ball from the right that is out of place
            if s[right] == '1':
                right -= 1
                continue
            
            # At this point, s[left] == '1' and s[right] == '0'.
            # This is a misplaced pair. We need to swap them.
            # The number of adjacent swaps to move the '0' at `right`
            # to the `left` position is their distance.
            swaps += (right - left)
            
            # Move pointers inward after the conceptual swap
            left += 1
            right -= 1
            
        return swaps
```
**Complexity Analysis:**

*   **Time Complexity: O(n)**
    The `left` pointer only ever moves to the right, and the `right` pointer only ever moves to the left. In each step of the `while` loop, at least one pointer moves. Therefore, each element of the string is visited at most once, resulting in a linear time complexity.

*   **Space Complexity: O(1)**
    The algorithm uses a constant amount of extra space for the two pointers and the swap counter, regardless of the input string's size.

### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern (also known as the partitioning pattern). The key characteristics that signal this pattern are:

1.  **Partitioning Requirement:** The goal is to segregate elements into two distinct groups (white balls and black balls) in a contiguous manner.
2.  **Opposite Ends:** The most efficient way to achieve this partitioning is by working from the outside in. One pointer (`left`) establishes the boundary of the first group, while the other (`right`) establishes the boundary of the second group.
3.  **In-place Logic:** Although we don't physically modify the string, the logic simulates an in-place partitioning. The pointers find elements that violate their section's rule (`1` in the white section, `0` in the black section) and perform a "swap". In this specific problem, instead of a literal swap, we calculate the swap *cost*.

Whenever you encounter a problem that requires reordering an array or string to group elements with a certain property together (e.g., move all zeroes to the end, sort an array of `0`s, `1`s, and `2`s), the two-pointers-from-opposite-ends technique should be one of the first patterns you consider. It provides an elegant and efficient O(n) solution by avoiding the redundant work inherent in nested-loop approaches.