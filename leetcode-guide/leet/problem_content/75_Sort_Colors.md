---
### **75. Sort Colors**
**Link to Problem:** [https://leetcode.com/problems/sort-colors/](https://leetcode.com/problems/sort-colors/)

#### **1. Problem Statement**
Given an array `nums` containing integers representing colors (0 for red, 1 for white, and 2 for blue), the task is to sort the array **in-place**. The final arrangement should have all 0s first, followed by all 1s, and then all 2s. You are not allowed to use the library's built-in sort function.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward approach is to count the occurrences of each color and then overwrite the original array with the correct number of 0s, 1s, and 2s. This is a variation of Counting Sort. The process involves two separate passes over the array: one for counting and one for writing.

1.  **First Pass (Counting):** Iterate through the array and count the number of 0s, 1s, and 2s.
2.  **Second Pass (Overwriting):** Use the counts to rebuild the array. Start from the beginning of the array, fill it with the counted number of 0s, then the 1s, and finally the 2s.

**Python Code:**
```python
def sortColors(nums: list[int]) -> None:
    """
    Sorts the array using a two-pass counting sort algorithm.
    """
    # Step 1: Count the occurrences of each color.
    count_0 = 0
    count_1 = 0
    count_2 = 0
    
    for num in nums:
        if num == 0:
            count_0 += 1
        elif num == 1:
            count_1 += 1
        else:
            count_2 += 1
            
    # Step 2: Overwrite the original array based on the counts.
    # We use an index `i` to keep track of our position in `nums`.
    i = 0
    
    # Place all the 0s.
    for _ in range(count_0):
        nums[i] = 0
        i += 1
        
    # Place all the 1s.
    for _ in range(count_1):
        nums[i] = 1
        i += 1
        
    # Place all the 2s.
    for _ in range(count_2):
        nums[i] = 2
        i += 1

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    This is because we iterate through the array twice. The first loop to count elements takes O(N) time, and the second phase to overwrite the array also takes O(N) time (N for 0s + N for 1s + N for 2s in total). Thus, the total complexity is O(N) + O(N) = O(N).

*   **Space Complexity: O(1)**
    We only use a few extra variables to store the counts, regardless of the size of the input array. This is constant extra space.

### **3. Optimized Approach: [Pattern 4: Two Pointers - In-place Array Modification]**
**Intuition:**
We can improve upon the two-pass approach by sorting the array in a **single pass** using three pointers. This algorithm is famously known as the **Dutch National Flag problem** solution, a classic example of in-place partitioning.

The core idea is to partition the array into three sections:
1.  A section for `0`s at the beginning.
2.  A section for `1`s in the middle.
3.  A section for `2`s at the end.

We'll use three pointers to manage these sections:
*   `low`: Points to the position where the next `0` should go. Everything to the left of `low` is guaranteed to be a `0`.
*   `high`: Points to the position where the next `2` should go. Everything to the right of `high` is guaranteed to be a `2`.
*   `mid`: The current element being considered. It iterates from the beginning to the end of the array.

The algorithm proceeds as follows, maintaining the invariant `low <= mid <= high`:
- If `nums[mid]` is a `0`, it belongs in the `low` section. We swap `nums[low]` with `nums[mid]` and then increment both `low` and `mid`.
- If `nums[mid]` is a `1`, it's in the correct potential position. We don't need to move it, so we just increment `mid`.
- If `nums[mid]` is a `2`, it belongs in the `high` section. We swap `nums[high]` with `nums[mid]` and then decrement `high`. We **do not** increment `mid` because the new element at `nums[mid]` (which came from `nums[high]`) has not been processed yet and needs to be checked.

Let's walk through an example: `nums = [2, 0, 1]`
- **Initial:** `low = 0`, `mid = 0`, `high = 2`. `nums = [2, 0, 1]`
- **`mid` is at index 0:** `nums[0]` is `2`. Swap `nums[mid]` with `nums[high]`.
  - `nums` becomes `[1, 0, 2]`.
  - Decrement `high`. `high` is now `1`. `mid` remains `0`.
- **`mid` is at index 0:** `nums[0]` is `1`. It's a `1`, so just increment `mid`.
  - `mid` is now `1`.
- **`mid` is at index 1:** `nums[1]` is `0`. Swap `nums[mid]` with `nums[low]`.
  - `nums` becomes `[0, 1, 2]`.
  - Increment `low` and `mid`. `low` is now `1`, `mid` is now `2`.
- **Loop condition:** `mid <= high` (i.e., `2 <= 1`) is now false. The loop terminates.
- **Final:** `nums = [0, 1, 2]`. The array is sorted in a single pass.

**Python Code:**
```python
def sortColors(nums: list[int]) -> None:
    """
    Sorts the array in-place using the Dutch National Flag algorithm (three pointers).
    This is a classic example of the Two Pointers - In-place Array Modification pattern.
    """
    # Pointers to define the boundaries of our three sections.
    # `low` is the boundary for the '0' section.
    # `high` is the boundary for the '2' section.
    low, mid, high = 0, 0, len(nums) - 1
    
    # The main loop continues as long as `mid` has not surpassed `high`.
    # The section between mid and high is the "unprocessed" zone.
    while mid <= high:
        # Case 1: The element at `mid` is a 0.
        if nums[mid] == 0:
            # Swap it with the element at the `low` boundary.
            nums[low], nums[mid] = nums[mid], nums[low]
            # Both `low` and `mid` pointers move one step to the right.
            # We increment `low` because we've placed a 0 correctly.
            # We increment `mid` because the element we swapped from `low` is
            # guaranteed to be a 0 or 1, which `mid` can safely pass.
            low += 1
            mid += 1
            
        # Case 2: The element at `mid` is a 1.
        elif nums[mid] == 1:
            # The element is in its correct potential place, so we just move on.
            mid += 1
            
        # Case 3: The element at `mid` is a 2.
        else: # nums[mid] == 2
            # Swap it with the element at the `high` boundary.
            nums[high], nums[mid] = nums[mid], nums[high]
            # The `high` pointer moves one step to the left, shrinking the
            # "unprocessed" zone from the right.
            high -= 1
            # IMPORTANT: We do NOT increment `mid` here. The new element at `mid`
            # came from the `high` position and we haven't processed it yet.
            # It could be a 0, 1, or 2, and needs to be checked in the next iteration.

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Although we have three pointers, the `mid` pointer iterates through the array from the beginning to the end. Each element is visited and processed at most a constant number of times. This results in a single-pass algorithm with linear time complexity.

*   **Space Complexity: O(1)**
    The sorting is performed entirely in-place. We only use three integer variables for our pointers, so the space required is constant and does not depend on the input size.

### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern. The signals that point to this pattern are:

1.  **In-place Requirement:** The problem explicitly forbids creating a new array and demands that the input array be modified directly. This is the strongest indicator for this pattern.
2.  **Partitioning Task:** The core of the problem is not just sorting, but **partitioning** the array into distinct, contiguous sections (`0`s, `1`s, `2`s).
3.  **Defined Boundaries:** The values (`0`, `2`) provide clear criteria for what belongs at the absolute start and absolute end of the array. Pointers (`low`, `high`) are perfect tools for managing the boundaries of these growing, sorted partitions.

By using pointers to track the boundaries of the sorted "red" and "blue" sections, we can iterate through the array once with a third pointer (`mid`), swapping elements into their correct partitions as we find them. This avoids the need for a second pass or extra storage, perfectly demonstrating the power and efficiency of the in-place modification pattern.