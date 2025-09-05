---
### **905. Sort Array By Parity**
**Link to Problem:** [https://leetcode.com/problems/sort-array-by-parity/](https://leetcode.com/problems/sort-array-by-parity/)

#### **1. Problem Statement**
Given an integer array `nums`, the task is to rearrange its elements such that all the even integers appear at the beginning of the array, followed by all the odd integers. The relative order of the elements within the even and odd groups does not need to be preserved.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward idea is to create a new array to store the result. We can iterate through the original input array and, for each number, decide where it should go in our new array. A simple way to achieve this is to make two passes over the input: first, we iterate and collect all the even numbers, and second, we iterate again and collect all the odd numbers. This guarantees the desired partitioning.

**Python Code:**
```python
from typing import List

class Solution:
    def sortArrayByParity_brute_force(self, nums: List[int]) -> List[int]:
        # Create a new list to store the sorted result.
        # This approach requires extra memory proportional to the input size.
        result = []

        # First pass: Iterate through the input array to find and add all even numbers.
        for num in nums:
            if num % 2 == 0:
                result.append(num)

        # Second pass: Iterate through the input array again to find and add all odd numbers.
        for num in nums:
            if num % 2 != 0:
                result.append(num)
        
        return result

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    We iterate through the entire input array `nums` twice. The total number of operations is proportional to `N + N`, which simplifies to O(N), where N is the number of elements in the array.

*   **Space Complexity: O(N)**
    The main drawback of this approach is its space usage. We create a `result` array that is the same size as the input array `nums`, leading to a space complexity of O(N).

### **3. Optimized Approach: [Pattern 4: Two Pointers - In-place Array Modification]**
**Intuition:**
To improve upon the brute force solution, we need to eliminate the O(N) space complexity. This means we must perform the sort **in-place**, modifying the input array directly. The **Two Pointers** pattern is perfect for this kind of in-place rearrangement.

We can think of the array as having two sections we want to build: an "even" section at the beginning and an "odd" section at the end. We'll use two pointers to manage these sections:
1.  `left` pointer starts at the beginning of the array (index 0).
2.  `right` pointer starts at the end of the array (index `len(nums) - 1`).

The `left` pointer's job is to find the first *odd* number from the left, and the `right` pointer's job is to find the first *even* number from the right. When they both find their target, it means we have an odd number in the "even" section and an even number in the "odd" section. This is a mismatch, so we swap them. After the swap, both numbers are in their correct partitions. We then continue moving the pointers inward until they cross.

Let's walk through an example: `nums = [3, 1, 2, 4]`
*   **Initial:** `left = 0`, `right = 3`. `nums` is `[3, 1, 2, 4]`.
*   **Step 1:** `nums[left]` (3) is odd and `nums[right]` (4) is even. This is the exact mismatch we are looking for!
    *   Swap `nums[left]` and `nums[right]`. The array becomes `[4, 1, 2, 3]`.
    *   Move both pointers inward: `left` becomes 1, `right` becomes 2.
*   **Step 2:** `left = 1`, `right = 2`. `nums` is `[4, 1, 2, 3]`.
    *   `nums[left]` (1) is odd and `nums[right]` (2) is even. Another mismatch!
    *   Swap `nums[left]` and `nums[right]`. The array becomes `[4, 2, 1, 3]`.
    *   Move both pointers inward: `left` becomes 2, `right` becomes 1.
*   **Step 3:** Now `left` (2) is greater than `right` (1). The loop condition `left < right` is false, so we terminate.
*   **Final Result:** `[4, 2, 1, 3]`. All even numbers are at the beginning, followed by all odd numbers.

**Python Code:**
```python
from typing import List

class Solution:
    def sortArrayByParity(self, nums: List[int]) -> List[int]:
        # Initialize two pointers, one at the start and one at the end of the array.
        left, right = 0, len(nums) - 1

        # The loop continues as long as the pointers haven't crossed.
        while left < right:
            # Case 1: The number at the left pointer is odd and the one at the right is even.
            # This is the primary case where a swap is needed.
            if nums[left] % 2 != 0 and nums[right] % 2 == 0:
                # Swap the elements to move the even number to the left part
                # and the odd number to the right part.
                nums[left], nums[right] = nums[right], nums[left]
                # Move both pointers inward since we've placed both correctly.
                left += 1
                right -= 1
            else:
                # Case 2: The number at the left pointer is already even.
                # It's in the correct partition, so we move the left pointer to the right.
                if nums[left] % 2 == 0:
                    left += 1
                
                # Case 3: The number at the right pointer is already odd.
                # It's in the correct partition, so we move the right pointer to the left.
                if nums[right] % 2 != 0:
                    right -= 1
        
        return nums
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Although we have a `while` loop, the `left` and `right` pointers only move in one direction (inward). Each element in the array is visited at most once by either the `left` or the `right` pointer. Therefore, the time complexity is linear.

*   **Space Complexity: O(1)**
    The sorting is performed **in-place**. We are only using a few variables (`left`, `right`) to keep track of indices. This requires constant extra space, regardless of the input size.

### **4. Pattern Connection**
This problem is a classic example of the **Two Pointers - In-place Array Modification** pattern. The tell-tale signs that this pattern is applicable are:

1.  **In-place Requirement:** The core challenge is to rearrange the array without using extra space, which immediately points towards an in-place algorithm.
2.  **Partitioning Task:** The goal is to partition the array into two distinct groups based on a simple condition (even or odd). Two pointers are a natural fit for managing the boundaries of these two growing partitions from opposite ends of the array.
3.  **Order Invariance:** The problem statement explicitly mentions that the relative order within the partitions does not matter. This flexibility is key, as in-place swaps inherently alter the original ordering. If the relative order needed to be preserved, this specific two-pointer approach would not work, and a different (likely not O(1) space) algorithm would be needed.

Whenever you encounter a problem that asks you to segregate array elements into two groups in-place (e.g., negatives and positives, zeros and non-zeros, elements less than a pivot and those greater), the two-pointer technique moving from both ends towards the middle should be one of the first patterns you consider.