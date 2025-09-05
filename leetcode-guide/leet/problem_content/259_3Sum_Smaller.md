---
### **259. 3Sum Smaller**
**Link to Problem:** [https://leetcode.com/problems/3sum-smaller/](https://leetcode.com/problems/3sum-smaller/)

#### **1. Problem Statement**
Given an array of integers `nums` and a `target` value, the task is to find the number of unique index triplets `(i, j, k)` where `0 <= i < j < k < n` such that the sum of the corresponding elements `nums[i] + nums[j] + nums[k]` is strictly less than the `target`.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to simply check every possible unique triplet in the array. We can achieve this by using three nested loops. The outer loop will pick the first element `nums[i]`, the second loop will pick `nums[j]` from the elements after `i`, and the innermost loop will pick `nums[k]` from the elements after `j`. For each triplet, we calculate the sum and, if it's less than the `target`, we increment a counter.

**Python Code:**
```python
def threeSumSmaller_brute_force(nums: list[int], target: int) -> int:
    n = len(nums)
    if n < 3:
        return 0
    
    count = 0
    
    # First loop to fix the first element of the triplet
    for i in range(n - 2):
        # Second loop to fix the second element
        for j in range(i + 1, n - 1):
            # Third loop to find the third element
            for k in range(j + 1, n):
                # Check if the sum is smaller than the target
                if nums[i] + nums[j] + nums[k] < target:
                    count += 1
                    
    return count

```
**Complexity Analysis:**

*   **Time Complexity: O(n³)**
    This is due to the three nested loops. In the worst case, each loop runs proportional to the size of the array `n`, leading to a cubic time complexity.

*   **Space Complexity: O(1)**
    We only use a few variables to store the count and loop indices, so the extra space required is constant.

### **3. Optimized Approach: Pattern 1: Two Pointers - Converging (Sorted Array Target Sum)**
**Intuition:**
The `O(n³)` brute force solution is too slow for larger inputs. We can significantly improve performance by first sorting the array. Sorting allows us to use the **Two Pointers - Converging** pattern to efficiently find pairs that satisfy a condition.

The strategy is to iterate through the array with a single `for` loop, fixing one element `nums[i]` at a time. For each `nums[i]`, our goal is to find the number of pairs `(nums[j], nums[k])` in the rest of the array (where `j > i` and `k > j`) such that `nums[j] + nums[k] < target - nums[i]`. This transforms the problem into a "2Sum Smaller" subproblem.

We solve this subproblem using two pointers, `left` and `right`, initialized at the start (`i + 1`) and end of the remaining portion of the array.

Let's walk through an example: `nums = [-2, 0, 1, 3]`, `target = 2`.
1.  **Sort `nums`:** The array is already sorted.
2.  **Outer loop `i = 0` (`nums[i] = -2`):**
    *   We need to find pairs in `[0, 1, 3]` that sum to less than `target - nums[i] = 2 - (-2) = 4`.
    *   Initialize `left = 1`, `right = 3`. The pointers are on `0` and `3`.
    *   `sum = nums[left] + nums[right] = 0 + 3 = 3`.
    *   Since `3 < 4`, we have found valid pairs. The key insight is that if `(nums[left], nums[right])` works, then because the array is sorted, any element between `left` and `right` used as the second element will also work with `nums[left]`.
    *   The pairs are `(0, 3)` and `(0, 1)`. The number of such pairs is `right - left = 3 - 1 = 2`.
    *   We add `2` to our total count and move `left` forward to find new pairs: `left++`.
    *   `left` is now `2`, `right` is `3`. Pointers are on `1` and `3`.
    *   `sum = nums[left] + nums[right] = 1 + 3 = 4`.
    *   `4` is not less than `4`, so the sum is too large. To decrease the sum, we move `right` inward: `right--`.
    *   Now `left = 2`, `right = 2`. The loop terminates as `left` is no longer less than `right`.
3.  **Outer loop `i = 1` (`nums[i] = 0`):**
    *   We need pairs in `[1, 3]` that sum to less than `target - nums[i] = 2 - 0 = 2`.
    *   Initialize `left = 2`, `right = 3`. Pointers are on `1` and `3`.
    *   `sum = 1 + 3 = 4`. `4` is not less than `2`. Sum is too large, so `right--`.
    *   `left` and `right` pointers meet. The loop terminates.
4.  The outer loop finishes. The final count is `2`.

**Python Code:**
```python
def threeSumSmaller(nums: list[int], target: int) -> int:
    # Sorting is the essential first step for the two-pointer pattern.
    nums.sort()
    n = len(nums)
    count = 0
    
    # Iterate through the array, fixing the first element `nums[i]`.
    # We only need to go up to n-2 since we need at least two other elements.
    for i in range(n - 2):
        # Set up two pointers for the rest of the array.
        left, right = i + 1, n - 1
        
        # Use the converging two-pointer technique on the sub-array.
        while left < right:
            current_sum = nums[i] + nums[left] + nums[right]
            
            if current_sum < target:
                # If the sum with the 'right' element is smaller than the target,
                # then any element between 'left' and 'right' will also work
                # as the third element, because the array is sorted.
                # The number of such valid triplets is (right - left).
                count += (right - left)
                
                # To find more potential solutions, we need a larger sum.
                # The only way to increase the sum is to move the 'left' pointer forward.
                left += 1
            else:
                # The sum is too large or equal to the target.
                # To make the sum smaller, we must move the 'right' pointer inward.
                right -= 1
                
    return count

```
**Complexity Analysis:**

*   **Time Complexity: O(n²)**
    The initial sort takes `O(n log n)`. The main logic consists of a `for` loop that runs `n` times, and inside it, a `while` loop with two pointers. For each `i`, the `left` and `right` pointers traverse the sub-array at most once, making the inner part `O(n)`. This results in a total time complexity of `O(n log n + n²)`, which simplifies to `O(n²)`.

*   **Space Complexity: O(log n) to O(n)**
    The space complexity is dominated by the sorting algorithm. In Python, Timsort uses space that can range from `O(log n)` to `O(n)` depending on the data. If we were to implement a sort like Heapsort, it could be `O(1)`.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Converging (Sorted Array Target Sum)** pattern, extended from a 2Sum to a 3Sum context. The signals that point directly to this pattern are:

1.  **A Sorted Array is Key:** The problem doesn't require a sorted array, but sorting it is the crucial step that unlocks an efficient solution. The ability to logically move pointers inward or outward relies entirely on the sorted property.
2.  **Finding Combinations (Triplets) with a Sum Condition:** The core task is to find triplets that satisfy a condition based on their sum (`< target`). This is a classic setup for target-sum problems.
3.  **Reducing the Problem Space:** By fixing one element with an outer loop, we effectively reduce a `k`-sum problem to a `(k-1)`-sum problem on a subarray. Here, 3Sum Smaller becomes a series of 2Sum Smaller subproblems.
4.  **Converging Pointers for Efficient Search:** For each subproblem, the two pointers starting at opposite ends (`left` and `right`) efficiently scan all possible pairs. If the sum is too small, we move `left` forward; if too large, we move `right` backward. This systematic, linear scan avoids the nested loop of the brute-force approach, dramatically improving performance.

The "smaller than" variation adds a unique twist: when `nums[i] + nums[left] + nums[right] < target`, we don't just count one triplet. We leverage the sorted order to instantly count `right - left` valid triplets, which is the core optimization for this specific problem type.