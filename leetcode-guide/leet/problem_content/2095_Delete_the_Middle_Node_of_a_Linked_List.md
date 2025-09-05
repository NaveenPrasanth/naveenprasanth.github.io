---
### **2095. Delete the Middle Node of a Linked List**
**Link to Problem:** [https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/](https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/)

#### **1. Problem Statement**
You are given the `head` of a singly linked list. The task is to find the middle node of this list, delete it, and return the `head` of the modified list. The middle node is defined as the `floor(n / 2)`-th node from the beginning (0-indexed) where `n` is the total number of nodes.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to follow the definition directly. To find the middle node at index `floor(n/2)`, we first need to know the total number of nodes, `n`. This suggests a two-pass approach:

1.  **First Pass:** Traverse the entire linked list from beginning to end, simply to count the total number of nodes, `n`.
2.  **Second Pass:** Calculate the index of the node *before* the middle one (`middle_index - 1`). Traverse the list again from the `head`, stopping at this predecessor node.
3.  **Deletion:** Once at the predecessor, update its `next` pointer to skip over the middle node, effectively deleting it from the list.

A special case is a list with only one node, where deleting the middle node results in an empty list.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Edge Case: If the list is empty or has only one node,
        # deleting the middle node results in an empty list.
        if not head or not head.next:
            return None

        # --- First Pass: Count the total number of nodes ---
        count = 0
        current = head
        while current:
            count += 1
            current = current.next

        # --- Second Pass: Find the node *before* the middle ---
        # The middle node is at index floor(count / 2).
        # We need to stop at the node at index (middle - 1) to delete the middle.
        middle_predecessor_index = (count // 2) - 1
        
        # Reset pointer to the head for the second traversal.
        current = head
        for _ in range(middle_predecessor_index):
            current = current.next
            
        # --- Deletion ---
        # `current` is now the node just before the middle node.
        # We bypass the middle node by pointing `current.next` to the node after the middle.
        current.next = current.next.next

        return head

```
**Complexity Analysis:**

*   **Time Complexity:** O(N). We traverse the list once to count the nodes (N steps) and then traverse it up to halfway again to find the predecessor (N/2 steps). O(N + N/2) simplifies to O(N).
*   **Space Complexity:** O(1). We only use a few extra variables (`count`, `current`, etc.), so the space usage is constant.

### **3. Optimized Approach: Two Pointers - Fixed Separation (Nth Node from End)**
**Intuition:**
The brute-force approach requires two full or partial passes. We can optimize this to a single pass using the **Slow and Fast Pointer** technique, which is a classic application of this pattern.

The idea is to have two pointers, `slow` and `fast`, both starting at the `head`. The `fast` pointer moves two steps at a time, while the `slow` pointer moves one step at a time. By the time the `fast` pointer reaches the end of the list, the `slow` pointer will be positioned exactly at the middle node.

Why does this work? The `fast` pointer covers twice the distance of the `slow` pointer in the same amount of time. When `fast` has traversed the entire list (length `n`), `slow` will have traversed half the list (length `n/2`), landing it right on the middle node.

To *delete* the middle node, we need access to the node *before* it. We can achieve this by keeping a third pointer, `prev`, that always trails one step behind `slow`. When the loop terminates, `slow` is on the middle node, and `prev` is on the node right before it, ready for the deletion.

Let's walk through `[1, 3, 4, 7, 1, 2, 6]`:
- **Initial:** `prev = None`, `slow = 1`, `fast = 1`
- **Step 1:** `fast` moves to `4`, `slow` moves to `3`, `prev` moves to `1`.
- **Step 2:** `fast` moves to `1`, `slow` moves to `4`, `prev` moves to `3`.
- **Step 3:** `fast` moves to `6`, `slow` moves to `7`, `prev` moves to `4`.
- **End:** `fast.next` is now `None`. The loop stops. `slow` is at `7` (the middle), and `prev` is at `4` (the predecessor). We can now execute `prev.next = slow.next`.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def deleteMiddle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Edge Case: An empty list or a list with one node becomes an empty list.
        if not head or not head.next:
            return None

        # Initialize two pointers, slow and fast.
        # Fast moves twice as fast as slow.
        slow = head
        fast = head
        
        # prev will point to the node right before the slow pointer.
        # This is the node we need to modify for deletion.
        prev = None

        # --- Single Pass Traversal ---
        while fast and fast.next:
            # The fast pointer moves two steps.
            fast = fast.next.next
            
            # Update prev to slow's current position *before* moving slow.
            prev = slow
            
            # The slow pointer moves one step.
            slow = slow.next
            
        # When the loop ends, `slow` is at the middle node.
        # `prev` is at the node just before the middle.
        
        # Delete the middle node by linking the previous node to the next one.
        prev.next = slow.next
        
        return head
```
**Complexity Analysis:**

*   **Time Complexity:** O(N). Although we have two pointers, they both traverse the list in a single pass. The `fast` pointer determines the runtime, which is proportional to the list length, N.
*   **Space Complexity:** O(1). We only use three pointer variables, regardless of the size of the list.

### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers with Fixed (or Relative) Separation** pattern, specifically the "Slow and Fast Pointer" variation used for linked lists.

The signal for this pattern is any problem that requires finding a node at a relative position (like the middle, 1/3, etc.) or a fixed distance from the end of a list, without first knowing its size. The brute-force method's need for a preliminary "counting" pass is a strong indicator that a single-pass two-pointer solution exists.

By setting up a fixed relationship between the pointers' speeds (`fast` moves at 2x the speed of `slow`), we can find the halfway point in a single traversal. The core idea is that one pointer's journey across the entire structure gives us the exact location of another pointer at a fractional position. This elegant, single-pass solution is far more efficient than the two-pass brute-force approach, making it a crucial technique for linked list problems.