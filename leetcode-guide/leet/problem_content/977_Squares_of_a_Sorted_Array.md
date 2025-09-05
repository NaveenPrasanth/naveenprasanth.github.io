---
### **977. Squares of a Sorted Array**
**Link to Problem:** [https://leetcode.com/problems/squares-of-a-sorted-array/](https://leetcode.com/problems/squares-of-a-sorted-array/)

#### **1. Problem Statement**
Given an integer array `nums` that is sorted in non-decreasing order, the task is to return a new array containing the squares of each number, also sorted in non-decreasing order.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to follow the problem statement literally. First, we create a new list containing the square of each number from the input array. This new list, however, will not necessarily be sorted. For example, if the input is `[-4, -1, 0, 3]`, the squared list becomes `[16, 1, 0, 9]`. The second step, therefore, is to sort this list of squares to produce the final result.

**Python Code:**
```python
import collections

def sortedSquares_brute_force(nums: list[int]) -> list[int]:
    """
    Solves the problem by first squaring every element and then sorting the result.
    """
    # Step 1: Create a new array by squaring each element from the input array.
    # A list comprehension is a concise way to do this.
    squares = [num * num for num in nums]
    
    # Step 2: Sort the newly created list of squares.
    # Python's built-in sort() method is highly optimized (Timsort).
    squares.sort()
    
    return squares

# Example usage:
# nums = [-4, -1, 0, 3, 10]
# print(sortedSquares_brute_force(nums))  # Output: [0, 1, 9, 16, 100]
```
**Complexity Analysis:**

*   **Time Complexity: O(N log N)**
    The process of squaring each of the N elements takes O(N) time. However, the subsequent sorting step dominates the runtime. A standard comparison-based sorting algorithm, like Timsort (used in Python), has an average and worst-case time complexity of O(N log N).

*   **Space Complexity: O(N)**
    We create a new array, `squares`, to store the squared values, which requires space proportional to the number of elements in the input array. Note: In Python, `sorted()` would create a new list (O(N)), while `.sort()` sorts in-place (O(log N) or O(N) space depending on implementation). Since we already created a new list for the squares, the space complexity is O(N).

---

#### **3. Optimized Approach: [Pattern 1: Two Pointers - Converging]**
**Intuition:**
The brute-force approach has an O(N log N) complexity because it ignores a crucial piece of information: the input array is already sorted. We can leverage this property to build the sorted output array in a single pass, achieving a more optimal O(N) time complexity.

The key observation is that after squaring, the largest values will come from the numbers with the largest *absolute* values. Since the original array `nums` is sorted, these numbers with the largest magnitudes must be at the ends of the array.

For example, in `[-4, -1, 0, 3, 10]`, the candidates for the largest squared value are `(-4)^2 = 16` and `10^2 = 100`. The larger one is `100`. This will be the largest element in our final sorted array. The next largest will be a comparison between `(-4)^2 = 16` and `3^2 = 9`, and so on.

This insight leads directly to the **Two Pointers** pattern. We can place one pointer (`left`) at the beginning of the array and another (`right`) at the end. We compare the squares of the numbers at these two pointers and place the larger square at the end of our result array. We then move the pointer corresponding to the larger square inward and repeat the process, filling the result array from right to left (largest to smallest).

**Walkthrough with `nums = [-4, -1, 0, 3, 10]`:**
1.  Initialize `left = 0`, `right = 4`, and an empty result array `result = [0, 0, 0, 0, 0]`. We'll fill `result` from its last index, `k = 4`.
2.  `left_sq = (-4)^2 = 16`, `right_sq = 10^2 = 100`.
    *   `right_sq` is larger. Place `100` at `result[4]`.
    *   `result` is now `[0, 0, 0, 0, 100]`.
    *   Decrement `right` to 3 and `k` to 3.
3.  `left_sq = (-4)^2 = 16`, `right_sq = 3^2 = 9`.
    *   `left_sq` is larger. Place `16` at `result[3]`.
    *   `result` is now `[0, 0, 0, 16, 100]`.
    *   Increment `left` to 1 and decrement `k` to 2.
4.  `left_sq = (-1)^2 = 1`, `right_sq = 3^2 = 9`.
    *   `right_sq` is larger. Place `9` at `result[2]`.
    *   `result` is now `[0, 0, 9, 16, 100]`.
    *   Decrement `right` to 2 and `k` to 1.
5.  `left_sq = (-1)^2 = 1`, `right_sq = 0^2 = 0`.
    *   `left_sq` is larger. Place `1` at `result[1]`.
    *   `result` is now `[0, 1, 9, 16, 100]`.
    *   Increment `left` to 2 and decrement `k` to 0.
6.  Now `left` (2) and `right` (2) point to the same element.
    *   The loop continues. Place `0^2 = 0` at `result[0]`.
    *   The loop terminates as `left` becomes greater than `right`. The final `result` is `[0, 1, 9, 16, 100]`.

**Python Code:**
```python
def sortedSquares_two_pointers(nums: list[int]) -> list[int]:
    """
    Solves the problem in O(N) time using the two-pointer technique.
    """
    n = len(nums)
    # Initialize a result array of the same size, filled with zeros.
    result = [0] * n
    
    # Initialize two pointers, one at the start and one at the end of the input array.
    left, right = 0, n - 1
    
    # We will fill the result array from the end (largest to smallest).
    # 'k' is the pointer for the last available position in the result array.
    k = n - 1
    
    # The pointers will converge towards the center.
    while left <= right:
        left_square = nums[left] * nums[left]
        right_square = nums[right] * nums[right]
        
        # Compare the squares of the values at the two pointers.
        if left_square > right_square:
            # The left value's square is larger, so it belongs at the end of the sorted output.
            result[k] = left_square
            # Move the left pointer inward.
            left += 1
        else:
            # The right value's square is larger or equal, so it belongs at the end.
            result[k] = right_square
            # Move the right pointer inward.
            right -= 1
        
        # Move the result array's fill position to the left.
        k -= 1
            
    return result

# Example usage:
# nums = [-4, -1, 0, 3, 10]
# print(sortedSquares_two_pointers(nums)) # Output: [0, 1, 9, 16, 100]
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    We use two pointers, `left` and `right`, that iterate through the array. The `left` pointer only moves forward, and the `right` pointer only moves backward. In total, they will make N steps. Since we iterate through the array only once, the time complexity is linear.

*   **Space Complexity: O(N)**
    We are creating a `result` array of the same size as the input array. Therefore, the space required is proportional to the input size. (This is often stated as O(1) *auxiliary* space if the space for the output array is not counted, but it's clearer to state O(N) as per standard problem constraints).

---

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Converging** pattern, adapted for building a new sorted array rather than finding a pair with a specific property. The signals that point to this pattern are:

1.  **Sorted Input Array:** The most crucial prerequisite. The fact that `nums` is sorted guarantees that the elements with the largest absolute values are at the extremes. This property is what allows us to make a definite decision about the largest remaining element by only looking at the two ends.

2.  **Creating a Sorted Output from a Sorted Input:** The task is not to search, but to transform and re-sort. Whenever you need to create a new sorted array from an already sorted one, a two-pointer approach should be a primary consideration as it can often avoid a full O(N log N) sort.

While often associated with finding a target sum, the core principle of the "Converging Pointers" pattern is broader: **efficiently processing a sorted array from its opposite ends.** In this case, we use it to compare the "end" candidates (`nums[left]` and `nums[right]`) to determine which one produces the next value for our sorted result, effectively merging the negative and positive portions of the array into a final sorted list in a single, linear pass.