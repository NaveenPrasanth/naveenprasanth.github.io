---
### **283. Move Zeroes**
**Link to Problem:** [https://leetcode.com/problems/move-zeroes/](https://leetcode.com/problems/move-zeroes/)

#### **1. Problem Statement**
Given an integer array `nums`, the task is to move all the zeros to the end of it while maintaining the relative order of the non-zero elements. This operation must be performed **in-place**, meaning you cannot create a new copy of the array.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward idea that respects the in-place constraint is to iterate through the array. Whenever we encounter a zero, we can then start a second search from that point forward to find the next non-zero element. Once found, we swap the zero with that non-zero element. This process repeats until we've moved every zero past every non-zero number. This is conceptually similar to a bubble sort, where zeros are "bubbled" to the end.

**Python Code:**
```python
def moveZeroes_brute_force(nums: list[int]) -> None:
    """
    Modifies nums in-place using a brute-force nested loop approach.
    """
    n = len(nums)
    # The outer loop iterates through each element of the array.
    for i in range(n):
        # If we find a zero, we need to find a non-zero element to swap it with.
        if nums[i] == 0:
            # The inner loop searches for the *next* non-zero element.
            for j in range(i + 1, n):
                if nums[j] != 0:
                    # Perform the swap.
                    nums[i], nums[j] = nums[j], nums[i]
                    # Once a swap is made for the zero at index i, we can break
                    # the inner loop and continue the search for the next zero.
                    break

# Example usage:
# nums = [0, 1, 0, 3, 12]
# moveZeroes_brute_force(nums)
# print(nums) -> [1, 3, 12, 0, 0]
```

**Complexity Analysis:**

*   **Time Complexity: O(n²)**
    This is due to the nested loops. In the worst-case scenario (e.g., an array like `[0, 0, 0, 1]`), for each zero found by the outer loop, the inner loop may have to scan a significant portion of the remaining array.

*   **Space Complexity: O(1)**
    The solution is performed in-place. We only use a few variables for indices and swapping, which does not depend on the size of the input array.

#### **3. Optimized Approach: Two Pointers - In-place Array Modification**
**Intuition:**
The brute-force approach is slow because it repeatedly scans parts of the array. We can optimize this by realizing the problem can be rephrased: "bring all non-zero elements to the front of the array." The zeros will naturally be left behind. This is a classic partitioning problem, perfect for the Two Pointers pattern.

We'll use two pointers, let's call them `write_ptr` and `read_ptr`, both starting at the beginning of the array.
1.  `read_ptr`: Its job is to scan the array from left to right, one element at a time.
2.  `write_ptr`: Its job is to keep track of the position where the *next non-zero element* should be placed.

The algorithm works as follows:
*   The `read_ptr` moves forward unconditionally.
*   If `read_ptr` encounters a non-zero element, it means we've found an element that belongs in the "non-zero" section of the array. We copy this element's value to the location of `write_ptr`.
*   After copying, we advance `write_ptr` by one, effectively expanding the "non-zero" section.
*   If `read_ptr` encounters a zero, we simply ignore it and move on. The `write_ptr` stays put, waiting for the next non-zero element to overwrite its position.

**Example Walkthrough:** `nums = [0, 1, 0, 3, 12]`

| `read_ptr` | `nums[read_ptr]` | Action | `write_ptr` | `nums` State |
| :--- | :--- | :--- | :--- | :--- |
| 0 | 0 | Zero found. Do nothing. | 0 | `[0, 1, 0, 3, 12]` |
| 1 | 1 | Non-zero. `nums[write_ptr]` = `nums[read_ptr]`. Increment `write_ptr`. | 1 | `[1, 1, 0, 3, 12]` |
| 2 | 0 | Zero found. Do nothing. | 1 | `[1, 1, 0, 3, 12]` |
| 3 | 3 | Non-zero. `nums[write_ptr]` = `nums[read_ptr]`. Increment `write_ptr`. | 2 | `[1, 3, 0, 3, 12]` |
| 4 | 12 | Non-zero. `nums[write_ptr]` = `nums[read_ptr]`. Increment `write_ptr`. | 3 | `[1, 3, 12, 3, 12]` |

After the first pass, `nums` is `[1, 3, 12, 3, 12]` and `write_ptr` is at index 3. This means all non-zero elements are now correctly ordered in `nums[0...2]`. The final step is to fill the rest of the array (from `write_ptr` to the end) with zeros.

**Python Code:**
```python
def moveZeroes(nums: list[int]) -> None:
    """
    Modifies nums in-place using the two-pointer pattern.
    """
    # write_ptr keeps track of the position to place the next non-zero element.
    write_ptr = 0
    
    # The read_ptr iterates through the entire array.
    for read_ptr in range(len(nums)):
        # If we find a non-zero element with the read_ptr...
        if nums[read_ptr] != 0:
            # ...we place it at the write_ptr's position.
            # This operation is harmless if read_ptr and write_ptr are the same.
            nums[write_ptr] = nums[read_ptr]
            
            # The "non-zero" section has grown, so we advance the write_ptr.
            write_ptr += 1
            
    # After the first pass, all non-zero elements are at the front.
    # The section from write_ptr to the end must be filled with zeros.
    for i in range(write_ptr, len(nums)):
        nums[i] = 0

# Example usage:
# nums = [0, 1, 0, 3, 12]
# moveZeroes(nums)
# print(nums) -> [1, 3, 12, 0, 0]
```

**Complexity Analysis:**

*   **Time Complexity: O(n)**
    This is a significant improvement. We iterate through the array with `read_ptr` once to move the non-zero elements, and then we iterate through the remaining portion with another loop to fill in the zeros. Each element is visited a constant number of times, resulting in a linear time complexity.

*   **Space Complexity: O(1)**
    The solution is performed in-place. We only use two integer pointers, so the space used is constant and does not scale with the input size.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern. The key signals that point to this pattern are:

1.  **In-Place Requirement:** The problem explicitly forbids creating a new array. This is the strongest hint to consider an in-place algorithm, and two pointers are a primary tool for such tasks.
2.  **Array Partitioning:** The core task is to partition the array into two distinct, contiguous groups: non-zero elements at the beginning and zero elements at the end.
3.  **Conditional Logic:** The decision to move an element is based on a simple condition (`is the element zero?`).

The pattern works by using one pointer (`write_ptr`) to maintain the boundary of the "processed" or "correct" section of the array (in this case, the non-zeros). The second pointer (`read_ptr`) ventures into the "unprocessed" section to find elements that satisfy the condition and should be moved into the correct section. This "slow and fast pointer" dynamic is a common and powerful technique for in-place array manipulation. Whenever you need to segregate elements of an array into two groups in-place, this pattern should be one of the first you consider.