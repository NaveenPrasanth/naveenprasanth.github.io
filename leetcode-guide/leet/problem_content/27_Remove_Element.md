---
### **27. Remove Element**
**Link to Problem:** [https://leetcode.com/problems/remove-element/](https://leetcode.com/problems/remove-element/)

#### **1. Problem Statement**
Given an integer array `nums` and an integer `val`, the task is to remove all occurrences of `val` from `nums` **in-place**. The function should return `k`, which is the number of elements remaining in the array after removal. The first `k` elements of the `nums` array must contain the final result, and the order of these `k` elements can be different from their original order.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to iterate through the array and whenever we find an element that needs to be removed, we shift all subsequent elements one position to the left to "overwrite" it. This effectively removes the element and shortens the logical size of the array. We need to be careful when managing our loop index and the array's changing size.

**Python Code:**
```python
def removeElement_brute_force(nums: list[int], val: int) -> int:
    # 'i' is our main iterator, and 'n' is the effective size of the array.
    i = 0
    n = len(nums)
    
    while i < n:
        # If we find the element to remove...
        if nums[i] == val:
            # ...we shift every element after it one position to the left.
            # This is an expensive operation.
            for j in range(i + 1, n):
                nums[j - 1] = nums[j]
            
            # Since we've shifted the array, the effective size decreases by one.
            n -= 1
            
            # We do NOT increment 'i' here, because the new element at nums[i]
            # needs to be checked as well. It could also be 'val'.
        else:
            # If the current element is not 'val', it's fine. Move to the next one.
            i += 1
            
    # 'n' now holds the count of elements that are not 'val'.
    return n

```
**Complexity Analysis:**

*   **Time Complexity: O(N^2)**
    This is because in the worst-case scenario (an array where every element is `val`), the outer `while` loop runs up to `N` times. For each of these iterations, the inner `for` loop (the shifting operation) also runs up to `N` times, leading to a quadratic time complexity.

*   **Space Complexity: O(1)**
    The modification is done in-place, and we only use a few variables (`i`, `n`, `j`) for storage, which does not scale with the input size.

#### **3. Optimized Approach: Two Pointers - In-place Array Modification**
**Intuition:**
The brute-force approach is slow due to the costly O(N) shifting operation performed for every element we remove. We can eliminate this shifting by using a **two-pointer** technique.

The core idea is to partition the array into two sections:
1.  The beginning of the array (from `0` to `k-1`) will store the elements we want to keep.
2.  The rest of the array can be considered a "scratchpad" or ignored.

We'll use two pointers:
*   A "slow" pointer, let's call it `k` (or `write_pointer`), which keeps track of the next position to place an element we want to keep. It starts at index 0.
*   A "fast" pointer, let's call it `i` (or `read_pointer`), which iterates through the entire array to inspect every element.

The `fast` pointer (`i`) moves from left to right. When `nums[i]` is an element we want to **keep** (i.e., `nums[i] != val`), we copy its value to the `slow` pointer's position (`nums[k] = nums[i]`) and then advance the slow pointer (`k += 1`). If `nums[i]` is an element we want to **remove** (i.e., `nums[i] == val`), we simply ignore it and only advance the `fast` pointer.

Let's walk through an example: `nums = [0, 1, 2, 2, 3, 0, 4, 2]`, `val = 2`.

1.  Initialize `k = 0`.
2.  `i = 0`, `nums[0] = 0`. Not `val`. Copy `nums[0]` to `nums[k]`. `nums` becomes `[0, ...]`. Increment `k` to 1.
3.  `i = 1`, `nums[1] = 1`. Not `val`. Copy `nums[1]` to `nums[k]`. `nums` becomes `[0, 1, ...]`. Increment `k` to 2.
4.  `i = 2`, `nums[2] = 2`. This is `val`. Ignore it. `k` remains 2.
5.  `i = 3`, `nums[3] = 2`. This is `val`. Ignore it. `k` remains 2.
6.  `i = 4`, `nums[4] = 3`. Not `val`. Copy `nums[4]` to `nums[k]`. `nums` becomes `[0, 1, 3, ...]`. Increment `k` to 3.
7.  `i = 5`, `nums[5] = 0`. Not `val`. Copy `nums[5]` to `nums[k]`. `nums` becomes `[0, 1, 3, 0, ...]`. Increment `k` to 4.
8.  `i = 6`, `nums[6] = 4`. Not `val`. Copy `nums[6]` to `nums[k]`. `nums` becomes `[0, 1, 3, 0, 4, ...]`. Increment `k` to 5.
9.  `i = 7`, `nums[7] = 2`. This is `val`. Ignore it. `k` remains 5.

The loop finishes. We return `k = 5`. The first 5 elements of `nums` are now `[0, 1, 3, 0, 4]`.

**Python Code:**
```python
def removeElement(nums: list[int], val: int) -> int:
    # 'k' is the slow-runner. It marks the boundary of the processed, valid part of the array.
    # Everything to the left of 'k' is an element we want to keep.
    k = 0
    
    # 'i' is the fast-runner. It iterates through the entire array to inspect each element.
    for i in range(len(nums)):
        # If the element at the fast-runner is NOT the one we want to remove...
        if nums[i] != val:
            # ...we copy it to the position of the slow-runner.
            # This overwrites any 'val' elements that were there or simply rewrites
            # the same element if no 'val's have been found yet.
            nums[k] = nums[i]
            
            # We then advance the slow-runner to expand our "valid" subarray.
            k += 1
            
    # At the end, 'k' is the count of elements that are not 'val', 
    # and the first 'k' elements of the array contain the result.
    return k

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    This is a significant improvement. Both the `k` (slow) and `i` (fast) pointers traverse the array only once from beginning to end. Each element is read once, and a subset of elements are written to once.

*   **Space Complexity: O(1)**
    The algorithm operates directly on the input array (`in-place`) without allocating any additional data structures, so the space complexity is constant.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - In-place Array Modification** pattern. The signals that point to this pattern are:

1.  **In-place Requirement:** The problem explicitly states that the array must be modified *in-place*, which immediately suggests patterns that avoid creating new arrays.
2.  **Partitioning Task:** The core task is to segregate the array elements into two groups: those that are equal to `val` and those that are not. The pattern uses the slow pointer `k` to effectively create a boundary between the "kept" elements and the "discarded" elements.
3.  **Single Pass Efficiency:** The goal is to solve the problem efficiently, ideally in a single pass. The fast/slow pointer setup allows us to process the array and build the result simultaneously in one O(N) pass, avoiding the inefficient O(N^2) shifting of the brute-force method.

In this pattern, the "slow" pointer builds the final result at the start of the array, while the "fast" pointer explores ahead, finding the next valid piece of data to add to the result. This "read-ahead and write-behind" dynamic is the defining characteristic of using two pointers for in-place array restructuring.