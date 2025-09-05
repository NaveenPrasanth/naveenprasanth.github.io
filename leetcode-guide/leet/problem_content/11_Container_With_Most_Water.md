---
### **11. Container With Most Water**
**Link to Problem:** [https://leetcode.com/problems/container-with-most-water/](https://leetcode.com/problems/container-with-most-water/)

#### **1. Problem Statement**
Given an array of non-negative integers `height`, where each integer represents the height of a vertical line at a specific coordinate, the goal is to find the two lines that, along with the x-axis, create a container with the largest possible water capacity. The output should be this maximum area.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to consider every possible pair of vertical lines and calculate the area of the container they form. We can use a nested loop structure: the outer loop picks the first line (`i`), and the inner loop iterates through all subsequent lines (`j`) to form a pair. For each pair, we calculate the area and update a variable that tracks the maximum area found so far.

The area for any pair of lines `i` and `j` is determined by the shorter of the two lines (as water would spill over the shorter side) and the distance between them.
`Area = width * height = (j - i) * min(height[i], height[j])`

**Python Code:**
```python
from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        max_area = 0
        n = len(height)

        # The outer loop fixes the left line of the container.
        for i in range(n):
            # The inner loop tries every possible right line for the fixed left line.
            for j in range(i + 1, n):
                # The width is the distance between the two lines.
                width = j - i
                
                # The height of the container is limited by the shorter of the two lines.
                container_height = min(height[i], height[j])
                
                # Calculate the area for the current pair of lines.
                current_area = width * container_height
                
                # Update the maximum area found so far.
                max_area = max(max_area, current_area)
                
        return max_area

```
**Complexity Analysis:**

*   **Time Complexity: `O(N^2)`**
    This is due to the nested loops. For an array of size `N`, the outer loop runs `N` times, and the inner loop runs approximately `N` times for each outer iteration, leading to a quadratic time complexity.

*   **Space Complexity: `O(1)`**
    The algorithm uses a constant amount of extra space, as we only need a few variables to store the max area and loop indices.

### **3. Optimized Approach: Two Pointers - Converging**
**Intuition:**
The brute-force approach is inefficient because it considers many pairs that are guaranteed to be suboptimal. We can do much better by being strategic. The key insight is that the area is constrained by both the width and the height. To maximize the area, we want to maximize both.

This leads to the **Two Pointers** pattern. We can start with the widest possible container by placing one pointer (`left`) at the beginning of the array and another (`right`) at the very end. This configuration has the maximum possible width.

Now, how do we find a potentially larger area? We can't increase the width any further, so our only hope is to find a taller pair of lines. The current container's height is limited by the shorter of `height[left]` and `height[right]`.

Let's say `height[left]` is shorter than `height[right]`. If we move the `right` pointer inward, the width will decrease, and the new height will still be limited by `height[left]`. The new area will *definitively* be smaller. Therefore, there is no benefit in moving the pointer of the taller line.

The only logical move is to move the pointer of the *shorter* line inward. By doing this, we sacrifice a small amount of width, but we gain the *possibility* of finding a much taller line, which could lead to a larger overall area. We repeat this process—calculate the area, and move the shorter pointer inward—until the two pointers meet.

**Example:** `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`

1.  `left = 0`, `right = 8`. `h[l]=1`, `h[r]=7`. Width is 8.
    Area = `8 * min(1, 7) = 8`. Max area is 8.
    `h[l]` is shorter, so move `left` pointer: `left++`.
2.  `left = 1`, `right = 8`. `h[l]=8`, `h[r]=7`. Width is 7.
    Area = `7 * min(8, 7) = 49`. Max area is 49.
    `h[r]` is shorter, so move `right` pointer: `right--`.
3.  `left = 1`, `right = 7`. `h[l]=8`, `h[r]=3`. Width is 6.
    Area = `6 * min(8, 3) = 18`. Max area is still 49.
    `h[r]` is shorter, so move `right` pointer: `right--`.
4.  ...and so on, until `left` and `right` cross.

**Python Code:**
```python
from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        max_area = 0
        # Initialize two pointers at opposite ends of the array.
        left, right = 0, len(height) - 1
        
        # Loop until the pointers converge.
        while left < right:
            # Calculate the width of the current container.
            width = right - left
            
            # The height is limited by the shorter of the two lines.
            container_height = min(height[left], height[right])
            
            # Calculate the area and update the maximum.
            current_area = width * container_height
            max_area = max(max_area, current_area)
            
            # This is the core logic of the pattern.
            # We move the pointer that points to the shorter line.
            # This is because the shorter line is the limiting factor, and moving it
            # gives us a chance to find a taller line, which could increase the area.
            if height[left] < height[right]:
                left += 1  # Move the left pointer inward.
            else:
                right -= 1 # Move the right pointer inward.
                
        return max_area
```
**Complexity Analysis:**

*   **Time Complexity: `O(N)`**
    This is a significant improvement. The `left` pointer only moves from left to right, and the `right` pointer only moves from right to left. In each step of the `while` loop, one of the pointers moves. This means we will traverse the array only once, resulting in linear time complexity.

*   **Space Complexity: `O(1)`**
    Similar to the brute-force approach, we only use a constant amount of extra space for the pointers and the max area variable.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Converging** pattern. While often associated with sorted arrays (like finding a target sum), its core principle is applicable here in a more creative way.

The key signals that point to this pattern are:

1.  **Seeking a Pairwise Optimal Value:** The problem asks for the best *pair* of lines out of many possibilities to maximize a value (area).
2.  **Value Depends on Distance:** The area calculation depends not only on the values at the pointers (`height[i]`, `height[j]`) but also on the distance between them (`j - i`).
3.  **A "Greedy" Pruning Strategy:** The crucial characteristic is the ability to make a "greedy" decision to discard a large part of the search space. By starting at the maximum width, we can definitively say that to get a larger area, we *must* find a taller height. The only way to potentially achieve this is by moving the pointer of the current *shorter* line. This allows us to eliminate the shorter line from all future considerations, efficiently "converging" towards the optimal solution in a single pass.