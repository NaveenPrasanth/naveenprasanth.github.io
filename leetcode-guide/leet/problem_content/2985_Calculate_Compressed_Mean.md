---
### **2985. Calculate Compressed Mean**
**Link to Problem:** [https://leetcode.com/problems/calculate-compressed-mean/](https://leetcode.com/problems/calculate-compressed-mean/)

#### **1. Problem Statement**
Given an array of integers `nums` and a window size `k`, the task is to calculate the "compressed mean" for every contiguous subarray of length `k`. The compressed mean is defined as the integer division of the subarray's sum by its length (`sum // k`). The final output should be an array containing these compressed means for each subarray.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to follow the problem description literally. We can iterate through the array, and for each possible starting position of a subarray, we can generate that subarray, calculate its sum, compute the compressed mean, and store the result.

The process is as follows:
1.  Initialize an empty list called `result` to store our answers.
2.  Loop through the `nums` array with an index `i` from `0` up to the last possible starting point for a subarray of size `k` (which is `len(nums) - k`).
3.  In each iteration, extract the subarray `nums[i : i+k]`.
4.  Calculate the sum of this subarray.
5.  Perform integer division of the sum by `k`.
6.  Append this value to the `result` list.
7.  After the loop finishes, return the `result` list.

**Python Code:**
```python
from typing import List

class Solution:
    def compressedMean(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        # The number of subarrays of size k is n - k + 1
        num_subarrays = n - k + 1
        
        # If the array is too small to form a window of size k, return an empty list
        if num_subarrays <= 0:
            return []
            
        result = []
        
        # Iterate through each possible starting index of a subarray
        for i in range(num_subarrays):
            # For each starting index 'i', consider the subarray of length 'k'
            # Slicing creates a new temporary list for the window
            window = nums[i : i + k]
            
            # Calculate the sum of the current window from scratch
            window_sum = sum(window)
            
            # Calculate the compressed mean and append to our results
            compressed_mean = window_sum // k
            result.append(compressed_mean)
            
        return result

```
**Complexity Analysis:**

*   **Time Complexity:** `O(n * k)`
    This is because the outer loop runs `n - k + 1` times (which is `O(n)`). Inside the loop, `sum(window)` needs to iterate over `k` elements to calculate the sum. Therefore, the total time is proportional to `n * k`.

*   **Space Complexity:** `O(n)`
    We create a `result` array of size `n - k + 1`. In the worst case (e.g., `k=1`), this is `O(n)`. We are not counting the space used for the `window` slice inside the loop, which would be `O(k)`, as it is temporary and reused. The dominant factor is the output array.

### **3. Optimized Approach: [Pattern 8: Sliding Window - Fixed Size (Subarray Calculation)]**
**Intuition:**
The brute-force method is inefficient because it repeatedly calculates the sum of overlapping elements. For example, when calculating the sum for `nums[0:k]` and then `nums[1:k+1]`, we are re-summing `k-1` elements. The key insight of the sliding window pattern is to avoid this redundant work.

We can maintain a "window" of size `k` that slides across the array. Instead of re-calculating the sum of the entire window each time it moves, we can update the sum in constant time. When the window slides one position to the right:
1.  The element at the far-left edge of the old window is removed.
2.  The new element at the far-right edge of the new window is added.

By subtracting the outgoing element and adding the incoming element to our running sum, we get the sum of the new window in just two operations.

**Example Walkthrough:** `nums = [2, 4, 6, 8]`, `k = 2`

1.  **Initial Window:** `[2, 4]`.
    *   Calculate the initial `current_sum = 2 + 4 = 6`.
    *   `mean = 6 // 2 = 3`. Add `3` to `result`. `result = [3]`.
2.  **Slide the Window:** The window moves from `[2, 4]` to `[4, 6]`.
    *   The element `2` (at index 0) leaves the window.
    *   The element `6` (at index 2) enters the window.
    *   Update the sum: `current_sum = 6 - 2 + 6 = 10`.
    *   `mean = 10 // 2 = 5`. Add `5` to `result`. `result = [3, 5]`.
3.  **Slide Again:** The window moves from `[4, 6]` to `[6, 8]`.
    *   The element `4` (at index 1) leaves the window.
    *   The element `8` (at index 3) enters the window.
    *   Update the sum: `current_sum = 10 - 4 + 8 = 14`.
    *   `mean = 14 // 2 = 7`. Add `7` to `result`. `result = [3, 5, 7]`.
4.  The loop finishes. Return `[3, 5, 7]`.

This approach processes each element of the array a constant number of times, leading to a linear time complexity.

**Python Code:**
```python
from typing import List

class Solution:
    def compressedMean(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        
        # Edge case: if the array is smaller than the window size, no subarrays can be formed.
        if n < k:
            return []
            
        result = []
        
        # --- Step 1: Initialize the first window ---
        # Calculate the sum of the very first window of size k.
        current_sum = sum(nums[0:k])
        
        # Calculate and store the compressed mean for this first window.
        result.append(current_sum // k)
        
        # --- Step 2: Slide the window across the rest of the array ---
        # We start the loop from the k-th element, as this is the first
        # element that will "enter" our sliding window.
        for i in range(k, n):
            # The window slides one position to the right.
            # `nums[i]` is the new element entering the window.
            # `nums[i-k]` is the old element that's leaving the window from the left.
            
            # Update the sum in O(1) time.
            current_sum = current_sum + nums[i] - nums[i - k]
            
            # Calculate and store the compressed mean for the new window position.
            result.append(current_sum // k)
            
        return result
```
**Complexity Analysis:**

*   **Time Complexity:** `O(n)`
    We calculate the sum of the first window, which takes `O(k)`. Then, we loop from `k` to `n-1` (which is `n-k` iterations). Inside the loop, all operations (addition, subtraction, division) are `O(1)`. The total time complexity is `O(k + (n-k))`, which simplifies to `O(n)`. We traverse the array only once.

*   **Space Complexity:** `O(n)`
    The space required is dominated by the `result` array, which will have `n - k + 1` elements. This is `O(n)` in the worst case. If the output array is not considered, the space complexity is `O(1)` as we only use a few variables (`current_sum`, `i`, etc.).

### **4. Pattern Connection**
This problem is a quintessential example of the **Fixed-Size Sliding Window** pattern. The defining characteristics that signal this pattern are:

1.  **Fixed-Size Substructure:** The problem explicitly asks for a calculation on all contiguous subarrays of a *fixed size `k`*. This is the most prominent signal for this pattern. The "window" is our subarray, and its size never changes.
2.  **Efficient State Update:** The calculation being performed (sum) allows for a highly efficient update. When the window slides, the sum of the new window can be derived from the sum of the previous window in constant time. If the calculation were something complex that required re-evaluating all `k` elements every time (e.g., finding the median of the window), this pattern would be less effective.

The brute-force solution's `O(n*k)` complexity arises from re-computing work. The sliding window pattern's core principle is to eliminate this redundancy by maintaining a running state (`current_sum`) and updating it incrementally as the window slides, thereby achieving an optimal `O(n)` time complexity.