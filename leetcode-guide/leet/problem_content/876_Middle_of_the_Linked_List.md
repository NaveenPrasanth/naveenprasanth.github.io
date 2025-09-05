---
### **876. Middle of the Linked List**
**Link to Problem:** [https://leetcode.com/problems/middle-of-the-linked-list/](https://leetcode.com/problems/middle-of-the-linked-list/)

#### **1. Problem Statement**
Given the `head` of a singly linked list, the task is to find and return the middle node of that list. If the list contains an even number of nodes, there will be two middle nodes; in this case, the second middle node should be returned.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to find the middle of something is to first know its total size. The brute-force approach follows this logic directly. We can solve this in two distinct passes over the linked list:
1.  **First Pass (Count):** Traverse the entire list from the `head` to the end, counting the total number of nodes (`N`).
2.  **Second Pass (Find):** Calculate the index of the middle node, which is `N // 2`. Then, start another traversal from the `head` and stop after `N // 2` steps. The node at this position is our answer.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # --- First Pass: Count the total number of nodes ---
        count = 0
        current = head
        # Traverse the list to its end to get the total count.
        while current:
            count += 1
            current = current.next

        # --- Second Pass: Traverse to the middle node ---
        # Calculate the index of the middle node.
        # For a list of 5 nodes (0,1,2,3,4), middle is 5//2 = 2.
        # For a list of 6 nodes (0,1,2,3,4,5), middle is 6//2 = 3 (the second middle node).
        middle_index = count // 2
        
        # Reset the pointer to the beginning of the list for the second pass.
        current = head
        # Traverse half the list to reach the designated middle node.
        for _ in range(middle_index):
            current = current.next
            
        return current

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**
    We traverse the list twice. The first pass takes N steps to count the nodes. The second pass takes N/2 steps to reach the middle. The total time is O(N + N/2), which simplifies to O(N).

*   **Space Complexity: O(1)**
    We only use a few variables (`count`, `current`, `middle_index`) for storage, which does not depend on the size of the linked list.

#### **3. Optimized Approach: Two Pointers - Fixed Separation (Nth Node from End)**
**Intuition:**
The two-pass brute force approach is inefficient. We can find the middle node in a single pass using the **Fast and Slow Pointer** technique, a classic variation of the Two Pointer pattern.

The idea is to have two pointers, `slow` and `fast`, both starting at the `head`. In each iteration, the `slow` pointer advances by one step, while the `fast` pointer advances by two steps. Because the `fast` pointer moves at double the speed, by the time it reaches the end of the list, the `slow` pointer will have traveled exactly half the distance. This positions the `slow` pointer perfectly at the middle node.

Let's walk through an example: `1 -> 2 -> 3 -> 4 -> 5`
- **Initial:** `slow` is at 1, `fast` is at 1.
- **Step 1:** `slow` moves to 2. `fast` moves to 3.
- **Step 2:** `slow` moves to 3. `fast` moves to 5.
- **End:** `fast.next` is now `null`, so the loop terminates. The `slow` pointer is at node 3, which is the middle.

This works for even-length lists as well, correctly identifying the second middle node as required.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next

class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # Initialize two pointers, both starting at the head of the list.
        slow = head
        fast = head
        
        # The core of the fast/slow pointer pattern.
        # We must check for 'fast' and 'fast.next' to safely advance the fast pointer by two.
        # This condition naturally handles both odd and even length lists.
        while fast and fast.next:
            # Slow pointer moves one step at a time.
            slow = slow.next
            # Fast pointer moves two steps at a time.
            fast = fast.next.next
            
        # When the loop ends, the fast pointer has reached the end,
        # and the slow pointer is now at the middle.
        return slow
```

**Complexity Analysis:**

*   **Time Complexity: O(N)**
    Although we use two pointers, we only traverse the list once. The `fast` pointer reaches the end in N/2 steps, making the overall time complexity linear to the number of nodes. This is significantly faster in practice than the O(1.5N) of the brute-force method.

*   **Space Complexity: O(1)**
    We only need memory for the two pointers (`slow` and `fast`), resulting in constant space usage.

#### **4. Pattern Connection**
This problem is the quintessential example of the **Fast and Slow Pointer** technique, which is a powerful variant of the broader Two Pointers pattern.

The key signal for this pattern is when you need to find a node based on its **relative position** within a sequence (like the middle, the Nth from the end, or the start of a cycle) without first knowing the sequence's total length. A single pointer can only tell you about its immediate location. However, by introducing a second pointer and controlling the *relative speed* between the two, you can deduce positional information about the entire structure in a single pass. In this case, by setting one pointer's speed to be double the other's, we guarantee that when the `fast` pointer finishes, the `slow` pointer is at the halfway mark. This elegant single-pass solution is far more efficient than the naive two-pass approach and perfectly showcases the power of using two pointers in tandem.