---
### **26. Remove Duplicates from Sorted Array**
**Link to Problem:** [https://leetcode.com/problems/remove-duplicates-from-sorted-array/](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)

#### **1. Problem Statement**
Given an integer array `nums` that is sorted in non-decreasing order, the task is to remove the duplicate elements *in-place*. This means each unique element should appear only once, and the relative order of the unique elements must be preserved. The function should return `k`, the number of unique elements, and the first `k` elements of the `nums` array should be modified to contain these unique elements.

#### **2. Brute Force Approach**
**Intuition:**
A common first thought for removing duplicates is to use a data structure that inherently stores only unique items, like a `set`. We could iterate through the input array, add all elements to a set to automatically handle duplicates, and then overwrite the original array with the unique elements from the set. However, since the problem requires the order to be preserved and the array is already sorted, a simpler approach is to create a new list, iterate through the input, and only add an element to our new list if it's different from the last element we added. Finally, we'd copy this new list back into the original `nums` array.

This approach is straightforward but violates the problem's core constraint of performing the operation **in-place** with O(1) extra memory.

**Python Code:**
```python
def removeDuplicates_brute_force(nums: list[int]) -> int:
    # This approach is not truly in-place and uses O(N) extra space,
    # making it a good example of what not to do when faced with this constraint.
    if not nums:
        return 0

    # Use a new list to store unique elements while preserving order.
    unique_elements = []
    unique_elements.append(nums[0]) # The first element is always unique to start.

    for i in range(1, len(nums)):
        # If the current element is different from the last one added, it's unique.
        if nums[i] != unique_elements[-1]:
            unique_elements.append(nums[i])

    # Now, copy the unique elements back into the original array.
    # This is required to modify the input array as requested by the problem.
    for i in range(len(unique_elements)):
        nums[i] = unique_elements[i]
        
    return len(unique_elements)

# Example:
# nums = [0, 0, 1, 1, 1, 2, 2]
# unique_elements becomes [0, 1, 2]
# nums is modified to [0, 1, 2, 1, 1, 2, 2]
# The function returns 3. The caller only considers nums[:3].
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    This is because we iterate through the input array once to build our `unique_elements` list (O(N)) and then iterate through the `unique_elements` list to modify the original `nums` array (O(k), where k ≤ N). This results in a total time complexity of O(N).

*   **Space Complexity: O(N)**
    The primary drawback is the `unique_elements` list, which in the worst case (an array with all unique elements) will grow to the same size as the input array `nums`. This violates the O(1) extra space constraint.

### **3. Optimized Approach: Two Pointers - In-place Array Modification**
**Intuition:**
To solve this efficiently and in-place, we can use the **Two Pointer** technique. The key insight is that since the array is sorted, all duplicate elements will be grouped together. We can use this property to overwrite the duplicates with the next unique elements we find.

We'll define two pointers:
1.  **`slow` (or `write_pointer`)**: This pointer keeps track of the position where the next unique element should be placed. It starts at index 1 because the first element `nums[0]` is always considered unique and stays in its place.
2.  **`fast` (or `read_pointer`)**: This pointer scans the array from the second element (`index = 1`) onwards to find new, unique elements.

The algorithm works as follows: The `fast` pointer iterates through the array. At each step, we compare `nums[fast]` with the previous element `nums[fast - 1]`.
*   If `nums[fast]` is **the same** as `nums[fast - 1]`, it's a duplicate. We do nothing but increment the `fast` pointer to move on.
*   If `nums[fast]` is **different** from `nums[fast - 1]`, it's a unique element. We then copy its value to the position indicated by our `slow` pointer (`nums[slow] = nums[fast]`) and then increment the `slow` pointer to prepare for the next unique element.

Let's walk through an example: `nums = [0, 0, 1, 1, 2]`
- **Initial State:** `slow = 1`, `fast = 1`
- **`fast = 1`**: `nums[1]` (0) is equal to `nums[0]` (0). Duplicate. `fast` increments.
  - `nums` is `[0, 0, 1, 1, 2]`, `slow = 1`
- **`fast = 2`**: `nums[2]` (1) is not equal to `nums[1]` (0). Unique!
  - Copy `nums[fast]` to `nums[slow]`: `nums[1] = 1`.
  - Increment `slow` to 2.
  - `nums` is `[0, 1, 1, 1, 2]`, `slow = 2`
- **`fast = 3`**: `nums[3]` (1) is equal to `nums[2]` (1). Duplicate. `fast` increments.
  - `nums` is `[0, 1, 1, 1, 2]`, `slow = 2`
- **`fast = 4`**: `nums[4]` (2) is not equal to `nums[3]` (1). Unique!
  - Copy `nums[fast]` to `nums[slow]`: `nums[2] = 2`.
  - Increment `slow` to 3.
  - `nums` is `[0, 1, 2, 1, 2]`, `slow = 3`

The loop finishes. The final value of `slow` is 3, which is the number of unique elements. The first `slow` elements of `nums` are `[0, 1, 2]`.

**Python Code:**
```python
def removeDuplicates(nums: list[int]) -> int:
    # If the list is empty, there are no unique elements.
    if not nums:
        return 0

    # 'slow' pointer indicates the next position to write a unique element.
    # It starts at 1 because nums[0] is always in its correct place.
    slow = 1

    # 'fast' pointer iterates through the array to find unique elements.
    for fast in range(1, len(nums)):
        # Check if the current element is a new unique element.
        # Since the array is sorted, a new unique element is one that is
        # different from its immediate predecessor.
        if nums[fast] != nums[fast - 1]:
            # If it's unique, we place it at the 'slow' pointer's position.
            nums[slow] = nums[fast]
            
            # Move the slow pointer forward to mark the new end of the unique subarray.
            slow += 1
            
    # 'slow' now holds the count of unique elements, which is the new length.
    return slow

# Example:
# nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
# removeDuplicates(nums) returns 5
# nums becomes [0, 1, 2, 3, 4, 2, 2, 3, 3, 4] (the content beyond index 4 doesn't matter)
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    This is because the `fast` pointer traverses the array from the second element to the end exactly once. The `slow` pointer also moves forward but never exceeds the `fast` pointer. This gives us a single pass through the array.

*   **Space Complexity: O(1)**
    The algorithm is performed entirely in-place. We only use two integer variables (`slow` and `fast`) for the pointers, which is constant extra space regardless of the input array's size.

#### **4. Pattern Connection**
This problem is a classic example of the **Two Pointers - In-place Array Modification** pattern. The pattern is signaled by several key problem characteristics:

1.  **Input is a Sorted Array:** The sorted nature is the most critical clue. It ensures that duplicate elements are adjacent, allowing a linear scan to be effective. If the array were unsorted, we couldn't simply compare an element to its predecessor to check for uniqueness.
2.  **In-place Modification Required:** The problem explicitly forbids using extra space proportional to the input size (O(1) space complexity). This immediately pushes you to think about how to overwrite parts of the array itself.
3.  **Partitioning Logic:** The core task involves conceptually partitioning the array into two sections: the beginning part with the processed, unique elements, and the remaining part with elements yet to be considered. The `slow` pointer acts as the boundary for this partition, while the `fast` pointer ventures into the unprocessed section to find the next item to bring into the "clean" partition.

This pattern, often called the "slow and fast runner" technique, is fundamental for problems where you need to process an array and produce a result in the same array, effectively removing or rearranging elements based on some condition.