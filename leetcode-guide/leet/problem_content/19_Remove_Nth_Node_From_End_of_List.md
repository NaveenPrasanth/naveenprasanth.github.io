---
### **19. Remove Nth Node From End of List**
**Link to Problem:** [https://leetcode.com/problems/remove-nth-node-from-end-of-list/](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

#### **1. Problem Statement**
Given the `head` of a singly linked list and an integer `n`, the task is to remove the node that is `n` positions away from the end of the list. The function should then return the head of the potentially modified linked list.

#### **2. Brute Force Approach**
**Intuition:**
The most direct way to solve this is to realize that "nth from the end" is equivalent to "(Length - n + 1)th from the beginning". This insight suggests a two-pass algorithm:

1.  **First Pass:** Traverse the entire linked list once to calculate its total length, let's call it `L`.
2.  **Second Pass:** Calculate the position of the node to remove from the start: `target_pos = L - n`. To remove this node, we actually need to stop at the node *before* it. So, we traverse the list again from the `head`, stopping `target_pos - 1` times to reach the predecessor of the node we want to delete.
3.  **Deletion:** Once at the predecessor node, we update its `next` pointer to skip over the target node, effectively removing it from the list.

A small but important edge case is removing the head of the list itself (when `L == n`). Using a "dummy" or "sentinel" node that points to the original head simplifies this logic, as it ensures every node to be deleted has a predecessor.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        # A dummy node helps handle the edge case of removing the actual head node.
        dummy = ListNode(0, head)
        
        # --- First Pass: Calculate the length of the list ---
        length = 0
        current = head
        while current:
            length += 1
            current = current.next
            
        # --- Calculate position of the predecessor node ---
        # The node to remove is at position (length - n) from the start (0-indexed).
        # We need to traverse to the node *before* it.
        # So we start at the dummy and traverse (length - n) times.
        prev = dummy
        for _ in range(length - n):
            prev = prev.next
            
        # --- Second Pass: Remove the target node ---
        # prev is now the node just before the one we want to remove.
        # We bypass the target node by linking prev directly to the target's next node.
        if prev and prev.next:
            prev.next = prev.next.next
            
        # The dummy's next pointer points to the potentially new head of the list.
        return dummy.next
```
**Complexity Analysis:**

*   **Time Complexity:** `O(L)`, where `L` is the number of nodes in the list. We traverse the list twice: once to find the length (`L` steps) and once to find the predecessor node (`L-n` steps). This simplifies to `O(2L)`, which is `O(L)`.
*   **Space Complexity:** `O(1)`. We only use a few extra pointers (`dummy`, `current`, `prev`), so the space used is constant.

### **3. Optimized Approach: [Pattern 3: Two Pointers - Fixed Separation (Nth Node from End)]**
**Intuition:**
The brute-force approach requires two passes because we don't know where the end of the list is relative to a given node. The Two Pointers pattern allows us to solve this in a single pass. The key idea is to create a "fixed separation" or "gap" between two pointers.

1.  Initialize two pointers, `slow` and `fast`. For easier deletion, we'll start `slow` at a `dummy` node pointing to the head, and `fast` at the actual `head`.
2.  **Create the Gap:** First, we move the `fast` pointer `n` steps ahead into the list. Now, `fast` is `n` nodes ahead of `slow` (if we count the `dummy` node). This establishes our fixed separation.
3.  **Move in Tandem:** Next, we advance both `slow` and `fast` one step at a time. They move in parallel, maintaining their fixed separation.
4.  **Find the Target:** We continue this until the `fast` pointer reaches the end of the list (i.e., it becomes `None`). Because of the initial `n`-node gap, when `fast` is at the end, `slow` will be positioned exactly at the node *before* the nth node from the end.
5.  **Deletion:** We can now perform the deletion easily: `slow.next = slow.next.next`.

**Example:** `head = [1,2,3,4,5]`, `n = 2`. We want to remove `4`.

*   `dummy -> 1 -> 2 -> 3 -> 4 -> 5`
*   `slow` starts at `dummy`, `fast` starts at `1`.
*   Move `fast` `n=2` steps: `fast` is now at `3`.
*   Move both until `fast` is `None`:
    *   `slow` -> `1`, `fast` -> `4`
    *   `slow` -> `2`, `fast` -> `5`
    *   `slow` -> `3`, `fast` -> `None`
*   `fast` is `None`. `slow` is at `3`. The node to remove is `slow.next` (which is `4`). Perfect.
*   We set `3.next = 5`. The list becomes `[1,2,3,5]`.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        # A dummy node handles the edge case of removing the head node.
        dummy = ListNode(0, head)
        slow = dummy
        fast = head  # Start fast at the actual head
        
        # --- Phase 1: Create a fixed separation between slow and fast ---
        # Move the fast pointer n steps ahead.
        # This creates a gap of 'n' nodes between fast and where slow originally pointed (head).
        for _ in range(n):
            fast = fast.next
            
        # --- Phase 2: Move both pointers in tandem until fast reaches the end ---
        # While fast is not None, both pointers advance one step.
        # When 'fast' reaches the end (None), 'slow' will be perfectly
        # positioned just before the node we need to remove.
        while fast:
            slow = slow.next
            fast = fast.next
            
        # --- Phase 3: Remove the target node ---
        # 'slow' is now at the node just before the nth node from the end.
        # We bypass the target by updating the 'next' pointer.
        slow.next = slow.next.next
        
        # The dummy's 'next' still points to the head of the modified list.
        return dummy.next
```
**Complexity Analysis:**

*   **Time Complexity:** `O(L)`. The pointers traverse the list only once. The `fast` pointer goes from `head` to `None`, and `slow` follows for a portion of that journey. This is a single-pass solution.
*   **Space Complexity:** `O(1)`. We only use a constant number of extra variables (`dummy`, `slow`, `fast`).

#### **4. Pattern Connection**
This problem is a canonical example of the **Two Pointers - Fixed Separation** pattern. This pattern is signaled whenever a problem requires you to find a node or element that is a fixed distance `k` away from another element or, as in this case, from the end of a sequence, especially when you can't easily index from the end (like in a singly linked list).

The brute-force method's need for a preliminary pass to find the total length is the key inefficiency this pattern resolves. Instead of calculating the length `L` to determine the target position `L - n`, the pattern cleverly creates a physical gap of `n` nodes between two pointers. By moving these pointers in unison, this "gap" acts as a moving measurement tool. When the leading pointer (`fast`) reaches a known landmark (the end of the list), the trailing pointer's (`slow`) position is determined by that gap, landing it exactly where it needs to be to solve the problem in a single, efficient pass.