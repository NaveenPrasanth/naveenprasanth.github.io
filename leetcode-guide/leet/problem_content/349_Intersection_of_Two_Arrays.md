---
### **349. Intersection of Two Arrays**
**Link to Problem:** [https://leetcode.com/problems/intersection-of-two-arrays/](https://leetcode.com/problems/intersection-of-two-arrays/)

#### **1. Problem Statement**
Given two integer arrays, `nums1` and `nums2`, the task is to return an array containing their intersection. The key constraints are that each element in the result must be **unique**, and the order of the elements in the output does not matter.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to check every element of the first array against every element of the second array. We can iterate through `nums1`, and for each element, we scan the entirety of `nums2` to see if a match exists. To handle the "unique" requirement, we can use a hash set to store the common elements we find, which automatically prevents duplicates.

**Python Code:**
```python
def intersection_brute_force(nums1, nums2):
    # Use a set to store the intersection to automatically handle uniqueness.
    intersection_set = set()
    
    # Iterate through each number in the first array.
    for n1 in nums1:
        # For each number, iterate through the entire second array to look for a match.
        for n2 in nums2:
            if n1 == n2:
                # If a match is found, add it to our set.
                # If the element is already in the set, this operation does nothing.
                intersection_set.add(n1)
                # We can break here since we only care if it exists, not how many times.
                break
                
    # The problem asks for an array (list in Python) as output.
    return list(intersection_set)

# Complexity Analysis:
#
# Time Complexity: O(n * m)
# Where 'n' is the length of nums1 and 'm' is the length of nums2. This is because
# for every element in nums1, we potentially iterate through all elements of nums2,
# leading to a nested loop structure.
#
# Space Complexity: O(k)
# Where 'k' is the number of unique elements in the intersection. In the worst case,
# if the smaller array is a subset of the larger one, the space complexity would be
# O(min(n, m)) to store the result set.
```

#### **3. Optimized Approach: Two Pointers on Sorted Arrays**
*(Note: While categorized under "Converging Pointers", this problem uses a variation where two pointers traverse two separate arrays in the same direction, rather than converging from opposite ends of a single array. The core principle of using pointers to avoid redundant checks remains the same.)*

**Intuition:**
The brute-force approach is slow because for each element in `nums1`, we repeatedly search `nums2` from the beginning. We can do much better if the arrays are ordered.

The key insight is to **sort both arrays first**. Once sorted, we can use two pointers, one for each array, and traverse them in a single, linear pass. This is the essence of the Two Pointers pattern for this problem.

Let's walk through an example:
`nums1 = [4, 9, 5]`, `nums2 = [9, 4, 9, 8, 4]`

1.  **Sort:**
    *   `nums1` becomes `[4, 5, 9]`
    *   `nums2` becomes `[4, 4, 8, 9, 9]`

2.  **Initialize Pointers:**
    *   `p1` points to `nums1[0]` (value 4).
    *   `p2` points to `nums2[0]` (value 4).

3.  **Compare and Move:**
    *   **Iteration 1:** `nums1[p1]` (4) == `nums2[p2]` (4). We found an intersection! Add 4 to our result set. Advance **both** pointers.
        *   `p1` is now at index 1 (value 5). `p2` is at index 1 (value 4).
    *   **Iteration 2:** `nums1[p1]` (5) > `nums2[p2]` (4). The value in `nums2` is too small. To find a potential match for 5, we must look at a larger number in `nums2`. Advance `p2`.
        *   `p1` is at index 1 (value 5). `p2` is at index 2 (value 8).
    *   **Iteration 3:** `nums1[p1]` (5) < `nums2[p2]` (8). Now the value in `nums1` is too small. To find a potential match for 8, we must look at a larger number in `nums1`. Advance `p1`.
        *   `p1` is at index 2 (value 9). `p2` is at index 2 (value 8).
    *   **Iteration 4:** `nums1[p1]` (9) > `nums2[p2]` (8). The value in `nums2` is too small. Advance `p2`.
        *   `p1` is at index 2 (value 9). `p2` is at index 3 (value 9).
    *   **Iteration 5:** `nums1[p1]` (9) == `nums2[p2]` (9). Another intersection! Add 9 to the result set. Advance **both** pointers.
        *   `p1` is at index 3 (out of bounds).
    *   The `while` loop terminates because `p1` is out of bounds. The final result is `{4, 9}`.

**Python Code:**
```python
def intersection_two_pointers(nums1, nums2):
    # The two-pointer approach requires sorted arrays to work correctly.
    # This is the crucial pre-processing step.
    nums1.sort()
    nums2.sort()
    
    # Initialize pointers at the beginning of each array.
    p1, p2 = 0, 0
    result_set = set()
    
    # The main loop continues as long as both pointers are within their array's bounds.
    while p1 < len(nums1) and p2 < len(nums2):
        # Case 1: The elements are equal, we found an intersection.
        if nums1[p1] == nums2[p2]:
            result_set.add(nums1[p1])
            # Advance both pointers to look for the next potential intersection.
            p1 += 1
            p2 += 1
        # Case 2: The element in nums1 is smaller.
        # We need to advance p1 to find a potentially larger value to match nums2[p2].
        elif nums1[p1] < nums2[p2]:
            p1 += 1
        # Case 3: The element in nums2 is smaller.
        # We need to advance p2 to find a potentially larger value to match nums1[p1].
        else: # nums1[p1] > nums2[p2]
            p2 += 1
            
    return list(result_set)

# Complexity Analysis:
#
# Time Complexity: O(n log n + m log m)
# The dominant operation is sorting. Sorting nums1 takes O(n log n) and nums2 takes
# O(m log m). The subsequent two-pointer scan takes only O(n + m) because each
# pointer moves forward and traverses its array just once. The overall complexity
# is therefore determined by the sorting step.
#
# Space Complexity: O(k) or O(n + m)
# The space for the output set is O(k), where 'k' is the number of intersection elements.
# However, it's important to note that the sorting algorithm itself might require auxiliary space.
# Python's Timsort can use up to O(n) space in the worst case. If we are not allowed to
# modify the input arrays, we would need O(n + m) space to store the sorted copies.
```

#### **4. Pattern Connection**
This problem is a classic example of the **Two Pointers** pattern, specifically the variant applied to two separate arrays. The key signal for this pattern is when you need to find pairs of elements or commonalities between **two sorted sequences**.

The brute-force solution's inefficiency stems from its O(n*m) comparisons. Sorting the arrays is the critical enabler. It imposes an order that allows us to discard parts of the search space intelligently. If `nums1[p1]` is smaller than `nums2[p2]`, we know for a fact that `nums1[p1]` cannot match `nums2[p2]` or any subsequent elements in `nums2` (since `nums2` is sorted). Therefore, we can safely advance `p1` without ever looking back. This single-pass, coordinated movement of two pointers after a sorting pre-step is the hallmark of this pattern, effectively reducing the comparison time complexity from quadratic to linear.