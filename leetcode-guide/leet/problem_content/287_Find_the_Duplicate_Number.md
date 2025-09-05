---
### **287. Find the Duplicate Number**
**Link to Problem:** [https://leetcode.com/problems/find-the-duplicate-number/](https://leetcode.com/problems/find-the-duplicate-number/)

#### **1. Problem Statement**
You are given an array of `n + 1` integers, `nums`, where each integer is in the range `[1, n]` inclusive. Since there are `n+1` numbers but only `n` possible values, at least one number must be repeated. Your task is to find this single duplicate number, with the critical constraints that you **cannot modify the input array** and must use only **constant, O(1) extra space**.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to find a duplicate is to compare every number with every other number in the array. We can use a nested loop: the outer loop picks an element, and the inner loop iterates through the rest of the array to see if a matching element exists. If a match is found, we have found our duplicate.

**Python Code:**
```python
def findDuplicate_brute(nums: list[int]) -> int:
    """
    Finds the duplicate number by comparing every element with every other element.
    """
    n = len(nums)
    # The outer loop picks an element one by one.
    for i in range(n):
        # The inner loop checks if this element appears again later in the array.
        for j in range(i + 1, n):
            # If we find two elements at different indices with the same value,
            # we have found the duplicate.
            if nums[i] == nums[j]:
                return nums[i]
    return -1 # Should not be reached given the problem constraints
```
**Complexity Analysis:**

*   **Time Complexity:** `O(n^2)`. For each element, we scan the remainder of the array. This results in a nested loop structure, leading to quadratic time complexity.
*   **Space Complexity:** `O(1)`. We only use a few variables for loop indices, requiring no extra space that scales with the input size.

#### **3. Optimized Approach: Two Pointers - Fast & Slow (Cycle Detection)**
Before diving into the optimal solution, it's worth noting that common `O(n)` solutions are invalid here. Using a hash set would take `O(n)` space, and sorting the array would take `O(n log n)` time and violate the "no modification" rule. This is why a more creative approach is needed.

**Intuition:**
The key insight is to re-frame the problem from finding a duplicate in an array to detecting a cycle in a linked list. We can imagine the array `nums` as a special kind of linked list where the value at each index `i` is a pointer to the next index, `nums[i]`.

For example, if `nums = [1, 3, 4, 2, 2]`:
*   A "node" at index `0` points to index `1` (since `nums[0] = 1`).
*   A "node" at index `1` points to index `3` (since `nums[1] = 3`).
*   A "node" at index `3` points to index `2` (since `nums[3] = 2`).
*   Both index `3` and index `4` point to index `2` (since `nums[3] = 2` and `nums[4] = 2`).

This structure guarantees a cycle. Since all numbers are between `1` and `n`, and indices are from `0` to `n`, every "pointer" `nums[i]` leads to a valid subsequent index. Because there are `n+1` "pointers" (the numbers) but only `n` distinct indices to point to (indices `1` to `n`), at least two pointers must point to the same index. This convergence creates a path that inevitably leads into a cycle. The duplicate number is the entry point of this cycle.

We can find this entry point using **Floyd's Tortoise and Hare (Cycle Detection) algorithm**:

1.  **Phase 1: Find the intersection point inside the cycle.**
    *   Initialize two pointers, `slow` and `fast`, at the start of the sequence (`nums[0]`).
    *   Move `slow` one step at a time (`slow = nums[slow]`).
    *   Move `fast` two steps at a time (`fast = nums[nums[fast]]`).
    *   Eventually, they will meet somewhere inside the cycle.

2.  **Phase 2: Find the entrance of the cycle.**
    *   Once they meet, reset one pointer (e.g., `slow`) back to the beginning (`nums[0]`).
    *   Keep the other pointer (`fast`) at the intersection point.
    *   Move both pointers one step at a time.
    *   The point where they meet again is the entrance to the cycle, which is our duplicate number.

**Python Code:**
```python
def findDuplicate(nums: list[int]) -> int:
    """
    Finds the duplicate number using Floyd's Tortoise and Hare algorithm.
    This treats the array as a functional graph and finds the cycle entrance.
    """
    # Phase 1: Find the intersection point of the two pointers.
    # The 'slow' pointer moves one step at a time.
    # The 'fast' pointer moves two steps at a time.
    slow, fast = 0, 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        # The pointers will eventually meet inside the cycle.
        if slow == fast:
            break
            
    # Phase 2: Find the entrance to the cycle.
    # Reset one pointer to the start of the array.
    slow2 = 0
    while True:
        # Move both pointers one step at a time.
        slow = nums[slow]
        slow2 = nums[slow2]
        # The point where they meet is the start of the cycle,
        # which corresponds to the duplicate number.
        if slow == slow2:
            return slow
```
**Complexity Analysis:**

*   **Time Complexity:** `O(n)`. In the first phase, the slow pointer travels at most `n` steps before entering the cycle. The fast pointer catches up within the cycle in at most `n` more steps. The second phase also takes at most `n` steps. The total time is linear.
*   **Space Complexity:** `O(1)`. We only use a few variables (`slow`, `fast`, `slow2`) to store pointers, fully satisfying the problem's constraints.

#### **4. Pattern Connection**
This problem is a quintessential, albeit disguised, example of the **Fast & Slow Pointers (Cycle Detection)** pattern. While it's presented as an array problem, its constraints create an underlying structure that is equivalent to a linked list with a cycle.

The key characteristics that signal this pattern are:
1.  **An Implicit Sequence:** The problem can be modeled as a sequence where each element points to another (`index -> value -> next_index`). This forms a functional graph.
2.  **Guaranteed Cycle:** The problem's constraints (`n+1` numbers in the range `[1,n]`) ensure that this sequence isn't just a simple path; it must contain a cycle. The "duplicate number" is the cause and the entry point of this cycle.
3.  **The Goal is the Cycle's Start:** The objective is not just to detect a cycle but to find its starting point, which is precisely what the second phase of Floyd's algorithm is designed to do.

Recognizing that an array problem can be transformed into a graph/linked list traversal is a powerful problem-solving skill. Whenever you encounter problems involving sequences, permutations, or arrays where values can be interpreted as indices, and you need to find duplicates or loops under strict memory constraints, the Fast & Slow Pointer pattern should be one of the first things you consider.