---
### **80. Remove Duplicates from Sorted Array II**
**Link to Problem:** [https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/](https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/)

#### **1. Problem Statement**
Given a sorted integer array `nums`, the task is to modify the array in-place to remove duplicate elements so that each unique number appears at most twice. You must return `k`, the length of the modified array, while preserving the relative order of the elements. The elements beyond the `k`-th position do not matter.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this without the in-place constraint would be to build a new array. We could iterate through the input array and add elements to a separate `result` array, but only if they don't violate the "at most twice" rule. After iterating through the entire input, we would copy the contents of our `result` array back into the beginning of the original `nums` array.

This approach is simple to conceptualize but fails the O(1) extra memory constraint, which is a key part of the problem. It serves as a good baseline to understand the requirements before optimizing.

**Python Code:**
```python
def removeDuplicates_brute_force(nums: list[int]) -> int:
    # This approach uses O(N) extra space, violating the problem's constraint.
    # It's presented here to illustrate the basic logic before optimizing.
    if len(nums) <= 2:
        return len(nums)

    # Use a new list to store the valid elements.
    result = []
    for num in nums:
        # We can add the number if the result list is not yet full (size < 2),
        # or if the current number is different from the number two positions back.
        # This check elegantly ensures we don't add a third duplicate.
        if len(result) < 2 or num != result[-2]:
            result.append(num)

    # Copy the valid elements from the result list back to the original nums array.
    for i in range(len(result)):
        nums[i] = result[i]

    # The new length is the size of our result list.
    return len(result)

# Complexity Analysis:
#
# Time Complexity: O(N)
# We iterate through the original array once to build the 'result' list (O(N)),
# and then iterate through the 'result' list to copy elements back (O(k), where k <= N).
# This results in a linear time complexity of O(N).
#
# Space Complexity: O(N)
# We create a new 'result' list that can, in the worst case (no duplicates),
# grow to the same size as the input array. This violates the O(1) space constraint.
```

### **3. Optimized Approach: Two Pointers - In-place Array Modification**
**Intuition:**
To satisfy the O(1) space complexity, we must modify the array in-place. This is the perfect scenario for the **In-place Array Modification** two-pointer pattern.

We can think of the array as having two regions: the processed, valid section at the beginning, and the unprocessed section that we are iterating through.
1.  **`write_ptr` (slow pointer):** This pointer (let's call it `k`) marks the end of the valid section. It indicates the next position where a valid number should be placed. It starts at `0`.
2.  **`read_ptr` (fast pointer):** This pointer simply iterates through every element of the array from beginning to end to examine it.

The core idea is to iterate with the `read_ptr` and decide if the element it's pointing to should be kept. If it should, we copy it to the `write_ptr`'s position and advance the `write_ptr`.

How do we decide if a number `num` should be kept?
A number is valid if it's one of the first two elements we're placing, or if it's different from the element *two positions before* the current `write_ptr`. The element at `nums[k-1]` is the one we just placed, and the one at `nums[k-2]` is the one before that. If our current `num` is the same as `nums[k-2]`, it would be the third instance, which is not allowed.

Let's walk through `nums = [1, 1, 1, 2, 2, 3]`:
-   Initialize `k = 0`.
-   `num = 1`: `k` is 0, which is `< 2`. It's a valid element. So, `nums[0] = 1`, and `k` becomes `1`. Array state: `[1, ...]`.
-   `num = 1`: `k` is 1, which is `< 2`. It's a valid element. So, `nums[1] = 1`, and `k` becomes `2`. Array state: `[1, 1, ...]`.
-   `num = 1`: `k` is 2. We check the condition `num > nums[k-2]`. Is `1 > nums[2-2]` (i.e., `1 > nums[0]`)? No, `1` is not greater than `1`. We don't copy it. `k` remains `2`.
-   `num = 2`: `k` is 2. We check `num > nums[k-2]`. Is `2 > nums[0]`? Yes, `2 > 1`. It's a valid element. So, `nums[2] = 2`, and `k` becomes `3`. Array state: `[1, 1, 2, ...]`.
-   `num = 2`: `k` is 3. We check `num > nums[k-2]`. Is `2 > nums[3-2]` (i.e., `2 > nums[1]`)? Yes, `2 > 1`. It's a valid element. So, `nums[3] = 2`, and `k` becomes `4`. Array state: `[1, 1, 2, 2, ...]`.
-   `num = 3`: `k` is 4. We check `num > nums[k-2]`. Is `3 > nums[4-2]` (i.e., `3 > nums[2]`)? Yes, `3 > 2`. It's a valid element. So, `nums[4] = 3`, and `k` becomes `5`. Array state: `[1, 1, 2, 2, 3, ...]`.

The loop finishes. We return `k=5`, and the first 5 elements of `nums` are correctly `[1, 1, 2, 2, 3]`.

**Python Code:**
```python
def removeDuplicates(nums: list[int]) -> int:
    # 'k' will be the "write pointer". It tracks the index of the last valid element + 1.
    # It essentially represents the length of the valid, modified part of the array.
    k = 0
    
    # The 'for' loop implicitly uses a "read pointer" ('num') to scan the array.
    for num in nums:
        # The condition to keep an element is:
        # 1. We are at the beginning of the array (k < 2), so we can accept up to two elements.
        # OR
        # 2. The current number 'num' is different from the number two positions
        #    before the write pointer. nums[k-2] is the first of the potential duplicates.
        #    If num is greater, it means it's a new number, so we should keep it.
        if k < 2 or num > nums[k-2]:
            # This is a valid element, so we place it at the 'k' position.
            nums[k] = num
            # We advance the write pointer to the next empty slot.
            k += 1
            
    # 'k' now holds the length of the modified array.
    return k

# Complexity Analysis:
#
# Time Complexity: O(N)
# We iterate through the array only once. Both the implicit 'read pointer' (from the loop)
# and the explicit 'write pointer' ('k') traverse the array at most N times.
#
# Space Complexity: O(1)
# The modification is done in-place. We only use a single extra variable 'k' for our pointer,
# achieving the required constant space complexity.
```

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern for several key reasons:

1.  **In-Place Requirement:** The problem explicitly demands an `O(1)` space solution, which is the primary trigger for this pattern. We cannot create a new array, so we must overwrite the input array itself.
2.  **Condensing/Filtering an Array:** The core task is to filter out unwanted elements (excess duplicates) and produce a condensed, valid result at the beginning of the same array.
3.  **Sorted Input:** The sorted nature of the array is a crucial enabler. It guarantees that all duplicate elements are grouped together, which simplifies the logic. We only need to compare the current element with the one at `k-2` to know if we have seen too many duplicates.

The pattern manifests as a "slow" pointer (`k`) that maintains the boundary of the valid, processed prefix of the array, and a "fast" pointer (the loop variable `num`) that scans ahead for the next element to be kept. When the fast pointer finds a suitable element, it gets copied to the slow pointer's location. This "read-ahead and write-behind" mechanism is the defining characteristic of this two-pointer technique for in-place modifications.