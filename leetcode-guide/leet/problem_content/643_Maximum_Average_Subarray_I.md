---
### **643. Maximum Average Subarray I**
**Link to Problem:** [https://leetcode.com/problems/maximum-average-subarray-i/](https://leetcode.com/problems/maximum-average-subarray-i/)

#### **1. Problem Statement**
Given an array of integers `nums` and an integer `k`, the task is to find the contiguous subarray of length `k` that has the maximum average value. The function should return this maximum average value.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to examine every possible contiguous subarray of length `k`. We can iterate through the array, treating each index as the potential start of a subarray. For each starting index `i`, we then form a subarray of length `k` (from `i` to `i + k - 1`) and calculate its sum. We keep track of the maximum sum found so far. After checking all possible subarrays, we divide the maximum sum by `k` to get the final average.

**Python Code:**
```python
import math

def findMaxAverage_bruteforce(nums: list[int], k: int) -> float:
    """
    Finds the maximum average of a subarray of size k using a brute-force approach.
    """
    # Initialize max_sum to a very small number to ensure any valid sum will be larger.
    max_sum = -math.inf
    n = len(nums)
    
    # The outer loop determines the starting point of each subarray.
    # We only need to start up to the point where a full subarray of size k can be formed.
    for i in range(n - k + 1):
        current_sum = 0
        # The inner loop calculates the sum for the current subarray starting at i.
        for j in range(i, i + k):
            current_sum += nums[j]
        
        # After calculating the sum of the current window,
        # update the overall maximum sum if needed.
        if current_sum > max_sum:
            max_sum = current_sum
            
    # The problem asks for the average, so we divide the maximum sum by k.
    return max_sum / k

```
**Complexity Analysis:**

*   **Time Complexity:** **O(n * k)**
    The outer loop runs `n - k + 1` times, and for each of these iterations, the inner loop runs `k` times to calculate the sum. This results in a time complexity proportional to `(n - k + 1) * k`, which simplifies to O(n * k).

*   **Space Complexity:** **O(1)**
    We only use a few variables (`max_sum`, `current_sum`, `i`, `j`) to store intermediate values, regardless of the input size.

### **3. Optimized Approach: [Pattern 8: Sliding Window - Fixed Size (Subarray Calculation)]**
**Intuition:**
The brute-force method is inefficient because it repeatedly re-calculates the sum of overlapping elements. For instance, when we move from the subarray `nums[0...k-1]` to `nums[1...k]`, we re-sum the common elements `nums[1...k-1]`.

The **Sliding Window** pattern eliminates this redundant work. The core idea is to maintain a "window" of size `k` and slide it across the array one element at a time. Instead of re-calculating the sum for each new window, we can update the sum from the previous window in constant time, O(1).

Here’s the step-by-step logic:
1.  **Initialize the Window:** Calculate the sum of the very first subarray (the first `k` elements). This sum becomes our initial `max_sum`.
2.  **Slide the Window:** Iterate from the `k`-th element to the end of the array. In each step:
    *   **Add the new element:** Add the current element (the one entering the window from the right) to our running sum.
    *   **Subtract the old element:** Subtract the element that is falling off the left side of the window.
3.  **Update Maximum:** After each slide, the running sum represents the sum of the new window. Compare this new sum with `max_sum` and update `max_sum` if the new sum is greater.
4.  **Calculate Final Average:** After the loop finishes, `max_sum` will hold the maximum sum of any contiguous subarray of size `k`. Divide it by `k` to get the result.

Let's walk through an example: `nums = [1, 12, -5, -6, 50, 3]`, `k = 4`.

1.  **Initial Window:** `[1, 12, -5, -6]`. `window_sum = 1 + 12 - 5 - 6 = 2`. `max_sum` is initialized to `2`.
2.  **Slide 1:**
    *   The window moves right. The new element is `50` (at index 4). The old element is `1` (at index 0).
    *   Update sum: `new_sum = 2 - 1 + 50 = 51`.
    *   Compare: `51 > 2`, so `max_sum` is now `51`.
3.  **Slide 2:**
    *   The window moves right again. The new element is `3` (at index 5). The old element is `12` (at index 1).
    *   Update sum: `new_sum = 51 - 12 + 3 = 42`.
    *   Compare: `42 < 51`, so `max_sum` remains `51`.
4.  The loop ends. The final result is `max_sum / k = 51 / 4 = 12.75`.

**Python Code:**
```python
def findMaxAverage(nums: list[int], k: int) -> float:
    """
    Finds the maximum average of a subarray of size k using a fixed-size sliding window.
    """
    # 1. Initialize the window
    # Calculate the sum of the first 'k' elements to establish the initial window.
    window_sum = sum(nums[0:k])
    max_sum = window_sum
    n = len(nums)
    
    # 2. Slide the window
    # Iterate from the k-th element to the end of the array.
    for i in range(k, n):
        # The core of the sliding window: update the sum in O(1).
        # Add the new element entering the window from the right.
        # Subtract the old element leaving the window from the left.
        window_sum += nums[i] - nums[i - k]
        
        # 3. Update Maximum
        # Check if the new window's sum is greater than the max sum found so far.
        max_sum = max(max_sum, window_sum)
            
    # 4. Calculate Final Average
    # Return the final average by dividing the overall maximum sum by k.
    return max_sum / k
```
**Complexity Analysis:**

*   **Time Complexity:** **O(n)**
    We calculate the sum of the first `k` elements, which takes O(k) time. Then, we iterate through the rest of the array from index `k` to `n-1`. This loop runs `n - k` times, and each step inside is an O(1) operation. The total time is O(k + (n - k)) = O(n). We process each element of the array a constant number of times.

*   **Space Complexity:** **O(1)**
    The algorithm uses only a few variables (`window_sum`, `max_sum`, `n`, `i`) for its calculations, so the space required is constant and does not depend on the size of the input array.

### **4. Pattern Connection**
This problem is a quintessential example of the **Fixed-Size Sliding Window** pattern. The key signals in the problem statement that point directly to this pattern are:

1.  **Contiguous Subarray:** The problem asks to operate on a "contiguous subarray," which is a primary indicator for window-based approaches.
2.  **Fixed Size `k`:** The constraint is on a subarray of a specific, unchanging length `k`. This "fixed size" is the most telling characteristic. Unlike variable-size window problems where you might expand/shrink the window based on a condition, here the window's size is constant, simplifying the logic to just "sliding."
3.  **Aggregate Calculation:** The goal is to find a maximum value derived from an aggregate property (sum, which leads to average) of these subarrays.

The brute-force solution's inefficiency arises from re-computing this aggregate value for overlapping subarrays. The Fixed-Size Sliding Window pattern is the direct optimization for this exact scenario. It elegantly maintains the aggregate value by making small, constant-time adjustments as the window slides, thereby reducing the time complexity from quadratic O(n*k) to a much more efficient linear O(n).