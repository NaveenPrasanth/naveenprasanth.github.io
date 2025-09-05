---
### **16. 3Sum Closest**
**Link to Problem:** [https://leetcode.com/problems/3sum-closest/](https://leetcode.com/problems/3sum-closest/)

#### **1. Problem Statement**
Given an array of integers `nums` and an integer `target`, the task is to find three integers in `nums` whose sum is closest to the `target`. You must return the sum of these three integers. It is guaranteed that each input will have exactly one solution.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to test every possible combination of three distinct numbers from the array. We can use three nested loops to iterate through all unique triplets. For each triplet, we calculate its sum and compare its absolute difference from the `target` with the smallest difference found so far. If the current triplet's sum is closer, we update our result.

**Python Code:**
```python
import math

class Solution:
    def threeSumClosest(self, nums: list[int], target: int) -> int:
        # Initialize with a very large difference to ensure the first sum is always closer.
        min_diff = math.inf
        closest_sum = 0
        n = len(nums)

        # The first loop selects the first number of the triplet.
        for i in range(n - 2):
            # The second loop selects the second number, starting after the first.
            for j in range(i + 1, n - 1):
                # The third loop selects the third number, starting after the second.
                for k in range(j + 1, n):
                    current_sum = nums[i] + nums[j] + nums[k]
                    current_diff = abs(target - current_sum)

                    # If this triplet's sum is closer to the target, update our result.
                    if current_diff < min_diff:
                        min_diff = current_diff
                        closest_sum = current_sum
        
        return closest_sum

```
**Complexity Analysis:**

*   **Time Complexity: O(N³)**
    This is due to the three nested loops, each of which can iterate up to N times, where N is the number of elements in `nums`. This approach is very slow for large inputs.

*   **Space Complexity: O(1)**
    We only use a few variables (`min_diff`, `closest_sum`, loop counters) for storage, regardless of the input size.

#### **3. Optimized Approach: [Pattern 1: Two Pointers - Converging (Sorted Array Target Sum)]**
**Intuition:**
The brute-force O(N³) complexity is inefficient. We can significantly improve this by first sorting the array. Sorting allows us to use a more methodical approach to finding the other two numbers once we've fixed one.

This problem can be reduced to a "2Sum Closest" problem. We iterate through the array with a single loop, fixing one number at a time (`nums[i]`). For each `nums[i]`, our goal is to find two other numbers in the rest of the array (`nums[i+1:]`) whose sum, combined with `nums[i]`, is as close to the `target` as possible.

This is where the **Converging Two Pointers** pattern excels. For each `nums[i]`, we set up two pointers in the remaining part of the array: a `left` pointer at `i + 1` and a `right` pointer at the end of the array. We then calculate the sum of the triplet `(nums[i], nums[left], nums[right])`.

Based on this sum, we can intelligently move the pointers:
*   If `current_sum` < `target`, we need a larger sum. Since the array is sorted, we move the `left` pointer one step to the right to include a larger number.
*   If `current_sum` > `target`, we need a smaller sum. We move the `right` pointer one step to the left to include a smaller number.
*   If `current_sum` == `target`, we've found a sum with a difference of 0, which is the best possible result. We can return this sum immediately.

We repeat this process, converging the `left` and `right` pointers, until they cross.

**Example:** `nums = [-1, 2, 1, -4]`, `target = 1`
1.  **Sort `nums`:** `[-4, -1, 1, 2]`
2.  Initialize `closest_sum` with the sum of the first three elements: `(-4) + (-1) + 1 = -4`. The initial minimum difference is `abs(1 - (-4)) = 5`.
3.  **Outer loop `i = 0` (`nums[i] = -4`):**
    *   `left = 1`, `right = 3`. Triplet: `(-4, -1, 2)`. Sum = `-3`.
    *   Difference `abs(1 - (-3)) = 4`. This is better than 5, so `closest_sum` becomes `-3`.
    *   Sum `-3` < `target` 1, so we need a larger sum. Increment `left`.
    *   `left = 2`, `right = 3`. Triplet: `(-4, 1, 2)`. Sum = `-1`.
    *   Difference `abs(1 - (-1)) = 2`. This is better than 4, so `closest_sum` becomes `-1`.
    *   Sum `-1` < `target` 1, so increment `left`. Now `left` equals `right`, ending the inner loop.
4.  **Outer loop `i = 1` (`nums[i] = -1`):**
    *   `left = 2`, `right = 3`. Triplet: `(-1, 1, 2)`. Sum = `2`.
    *   Difference `abs(1 - 2) = 1`. This is better than 2, so `closest_sum` becomes `2`.
    *   Sum `2` > `target` 1, so we need a smaller sum. Decrement `right`. Now `left` equals `right`, ending the inner loop.
5.  The outer loop finishes. The final `closest_sum` is **2**.

**Python Code:**
```python
import math

class Solution:
    def threeSumClosest(self, nums: list[int], target: int) -> int:
        # Sorting is crucial for the two-pointer approach.
        nums.sort()
        
        min_diff = math.inf
        closest_sum = 0
        n = len(nums)

        # Main loop to fix the first element of the triplet.
        for i in range(n - 2):
            # Initialize two pointers for the rest of the array.
            left = i + 1
            right = n - 1

            # The two pointers converge towards each other.
            while left < right:
                current_sum = nums[i] + nums[left] + nums[right]
                
                # Check if the current sum is closer to the target.
                current_diff = abs(target - current_sum)
                if current_diff < min_diff:
                    min_diff = current_diff
                    closest_sum = current_sum
                
                # --- Core logic of the Two Pointers pattern ---
                # Move pointers based on the comparison with the target.
                if current_sum < target:
                    # If the sum is too small, move the left pointer to a larger value.
                    left += 1
                elif current_sum > target:
                    # If the sum is too large, move the right pointer to a smaller value.
                    right -= 1
                else:
                    # If the sum is exactly the target, we've found the best possible answer.
                    return target
        
        return closest_sum

```
**Complexity Analysis:**

*   **Time Complexity: O(N²)**
    The initial sort costs O(N log N). The main logic consists of a `for` loop that runs N times, and inside it, a `while` loop with two pointers that traverse the rest of the array. This inner traversal takes O(N) time. Therefore, the total time complexity is O(N log N + N²), which simplifies to O(N²).

*   **Space Complexity: O(log N) to O(N)**
    This depends on the space complexity of the sorting algorithm used by the Python environment. Timsort, Python's default, can take up to O(N) space in the worst case. If we disregard the space for sorting, the algorithm itself uses O(1) extra space.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Converging** pattern for several key reasons:

1.  **Sorted Array Prerequisite:** The pattern's effectiveness hinges on the array being sorted. Sorting allows us to make a directional decision: if our sum is too small, we *know* we must move the left pointer rightward to a larger number. This sorted property is the primary signal to consider a two-pointer approach.

2.  **Finding a Combination with a Target Property:** The core task is to find a triplet (a specific combination of elements) that satisfies a condition related to a `target`. The two-pointer pattern is highly efficient for searching for pairs or triplets that meet sum-related criteria in a sorted array.

3.  **Reduction of Search Space:** By fixing one element with an outer loop, the problem is simplified to finding the best *pair* in a sub-array. The two pointers, starting at opposite ends and converging, systematically and efficiently eliminate possibilities. Instead of a brute-force O(N²) check for the pair, this pattern finds the best pair in just O(N) time, leading to the overall O(N²) solution for the 3Sum problem.

Whenever you encounter a problem that involves finding triplets, quadruplets, or pairs in an array that sum up to a target value, and constraints allow for an O(N²) or O(N³) solution, your first thought should be to **sort the array and apply the two-pointers pattern**. This problem extends the classic "2Sum" pattern by wrapping it in an outer loop, a very common and powerful technique.