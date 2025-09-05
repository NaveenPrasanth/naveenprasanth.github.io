---
### **167. Two Sum II - Input Array Is Sorted**
**Link to Problem:** [https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)

#### **1. Problem Statement**
Given a 1-indexed array of integers `numbers` that is sorted in non-decreasing order, the task is to find two numbers within it that add up to a specific `target` number. The output should be an array containing the 1-based indices of these two numbers. You can assume there is exactly one solution.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to consider every possible pair of numbers in the array. We can use a nested loop structure. The outer loop selects the first number, and the inner loop iterates through the rest of the array to find a second number. For each pair, we check if their sum equals the target. If it does, we have found our answer.

**Python Code:**
```python
class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        n = len(numbers)
        
        # The outer loop iterates through each element to serve as the first number of our pair.
        for i in range(n):
            # The inner loop iterates through the subsequent elements for the second number.
            # We start from i + 1 to avoid using the same element twice and to avoid duplicate pairs.
            for j in range(i + 1, n):
                # Check if the sum of the current pair matches the target.
                if numbers[i] + numbers[j] == target:
                    # The problem asks for 1-based indices, so we add 1 to our 0-based indices.
                    return [i + 1, j + 1]

```
**Complexity Analysis:**

*   **Time Complexity:** `O(n²)`
    This is due to the nested loops. For each element in the array, we iterate through almost all the other elements, leading to a quadratic number of comparisons in the worst case.

*   **Space Complexity:** `O(1)`
    The space required is constant as we only use a few variables for loop counters and do not allocate any additional data structures whose size depends on the input.

#### **3. Optimized Approach: Pattern 1: Two Pointers - Converging (Sorted Array Target Sum)**
**Intuition:**
The brute-force approach completely ignores a critical piece of information: **the input array is sorted**. This is a massive hint to use a more efficient approach. The "Two Pointers - Converging" pattern is tailor-made for this scenario.

The strategy is as follows:
1.  Initialize two pointers: `left` at the beginning of the array (index 0) and `right` at the end of the array (index `len(numbers) - 1`).
2.  Calculate the sum of the values at these two pointers: `current_sum = numbers[left] + numbers[right]`.
3.  Compare `current_sum` with the `target`:
    *   If `current_sum == target`, we've found our pair. We can return their 1-based indices.
    *   If `current_sum < target`, our sum is too small. Since the array is sorted, the only way to increase the sum is to use a larger number. We achieve this by moving the `left` pointer one step to the right (`left += 1`).
    *   If `current_sum > target`, our sum is too large. We need to decrease it by using a smaller number. We do this by moving the `right` pointer one step to the left (`right -= 1`).
4.  We repeat this process, "converging" the pointers towards each other, until they meet or cross. This systematically eliminates possibilities without ever needing to check every pair.

**Example Walkthrough:** `numbers = [2, 7, 11, 15]`, `target = 9`
- **Start:** `left = 0` (value 2), `right = 3` (value 15).
- **Step 1:** `current_sum = 2 + 15 = 17`.
- **Logic:** `17 > 9` (target), so the sum is too big. We must decrease it.
- **Action:** Move the `right` pointer inward: `right` is now `2`.
- **Step 2:** `left = 0` (value 2), `right = 2` (value 11). `current_sum = 2 + 11 = 13`.
- **Logic:** `13 > 9` (target), still too big.
- **Action:** Move `right` pointer inward again: `right` is now `1`.
- **Step 3:** `left = 0` (value 2), `right = 1` (value 7). `current_sum = 2 + 7 = 9`.
- **Logic:** `9 == 9` (target). We found the solution!
- **Result:** Return `[left + 1, right + 1]`, which is `[1, 2]`.

**Python Code:**
```python
class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        # Initialize two pointers, one at the very beginning and one at the very end.
        left, right = 0, len(numbers) - 1

        # Loop until the two pointers cross each other.
        # Since a solution is guaranteed, the loop will always find it before they cross.
        while left < right:
            # Calculate the sum of the values at the current pointer positions.
            current_sum = numbers[left] + numbers[right]

            if current_sum == target:
                # Found the solution! Return the 1-based indices.
                return [left + 1, right + 1]
            elif current_sum < target:
                # The sum is too small. To increase it, we must use a larger number.
                # The only way to do this is to move the left pointer forward.
                left += 1
            else: # current_sum > target
                # The sum is too large. To decrease it, we must use a smaller number.
                # The only way to do this is to move the right pointer backward.
                right -= 1
```
**Complexity Analysis:**

*   **Time Complexity:** `O(n)`
    In the worst-case scenario, the `left` and `right` pointers will collectively scan the entire array once. Each step of the `while` loop moves one of the pointers closer to the other, so we perform at most `n` comparisons. This is a significant improvement over the `O(n²)` brute-force approach.

*   **Space Complexity:** `O(1)`
    Just like the brute-force method, we only use a fixed number of variables (`left`, `right`, `current_sum`). The memory usage is constant and independent of the input array's size.

#### **4. Pattern Connection**
This problem is the canonical example of the **Two Pointers - Converging** pattern. The signals that point directly to this pattern are:

1.  **A Sorted Array:** This is the most crucial prerequisite. The sorted property is what gives us the logic to move the pointers intelligently. If the current sum is too small, we know for a fact that moving the `left` pointer to the right is the only way to increase the sum. If the sum is too large, moving `right` to the left is the only way to decrease it. Without this sorted property, our logic would fail.
2.  **Finding a Pair or a Target Value:** The goal is to find a *pair* of elements that satisfy a specific condition, usually related to their sum (e.g., equals `target`, is less than `target`, etc.).

By placing pointers at the two extremes and moving them inwards based on their sum, we efficiently narrow down the search space. Each comparison allows us to discard either the current `left` element or the current `right` element, along with all the pairs they could have formed with elements we've already passed. This linear-time traversal is the hallmark of the two-pointer technique on sorted arrays.