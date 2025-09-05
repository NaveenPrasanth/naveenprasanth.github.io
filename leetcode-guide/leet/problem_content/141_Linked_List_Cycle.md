---
### **141. Linked List Cycle**
**Link to Problem:** [https://leetcode.com/problems/linked-list-cycle/](https://leetcode.com/problems/linked-list-cycle/)

#### **1. Problem Statement**
Given the `head` of a singly linked list, the task is to determine if the list has a cycle. A cycle exists if some node in the list can be reached again by continuously following the `next` pointer. The function should return `True` if a cycle is present, and `False` otherwise.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to detect a cycle is to remember every node we've already visited. As we traverse the list from the head, we can store each node in a data structure that allows for quick lookups, like a hash set. If we ever encounter a node that is already in our set of visited nodes, we've confirmed a cycle. If we reach the end of the list (`None`) without seeing any duplicates, no cycle exists.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

def hasCycle_brute_force(head: ListNode) -> bool:
    # Use a hash set to store nodes we have already seen.
    # Sets provide O(1) average time complexity for add and check operations.
    visited_nodes = set()
    
    current_node = head
    # Traverse the list until we reach the end (current_node is None).
    while current_node:
        # If the current node is already in our set, we've found a cycle.
        if current_node in visited_nodes:
            return True
        
        # If not, add the current node to the set and move to the next one.
        visited_nodes.add(current_node)
        current_node = current_node.next
        
    # If the loop completes, it means we reached the end of the list, so no cycle exists.
    return False

```
**Complexity Analysis:**

*   **Time Complexity:** **O(N)**, where N is the number of nodes in the linked list. In the worst-case scenario (no cycle), we must visit every node once. Operations on the hash set (adding and checking for existence) take O(1) time on average.

*   **Space Complexity:** **O(N)**. In the worst-case scenario (no cycle), the `visited_nodes` set will store a reference to every single node in the list.

### **3. Optimized Approach: Two Pointers - Fast & Slow (Cycle Detection)**
**Intuition:**
This classic problem can be solved far more efficiently without using any extra space by applying the **Fast & Slow Pointers** pattern, also known as **Floyd's Tortoise and Hare Algorithm**.

Imagine two runners on a circular track: a fast runner and a slow runner. If they both start at the same point, the fast runner will eventually lap the slow runner. We can apply this exact analogy to a linked list.

1.  We initialize two pointers, `slow` and `fast`, both pointing to the `head` of the list.
2.  We move the `slow` pointer one step at a time (`slow = slow.next`).
3.  We move the `fast` pointer two steps at a time (`fast = fast.next.next`).

If the list has no cycle, the `fast` pointer will inevitably reach the end of the list (`None`) before the `slow` pointer. If the list *does* have a cycle, the `fast` pointer will enter the cycle first, and the `slow` pointer will follow. Once both pointers are inside the cycle, the `fast` pointer will start gaining on the `slow` pointer from behind and is guaranteed to eventually meet it at the same node.

**Example Walkthrough:**
List: `1 -> 2 -> 3 -> 4 -> 2` (Node 4 points back to Node 2)
*   **Start:** `slow` is at 1, `fast` is at 1.
*   **Step 1:** `slow` moves to 2. `fast` moves to 3.
*   **Step 2:** `slow` moves to 3. `fast` moves to 2 (from 3 -> 4 -> 2).
*   **Step 3:** `slow` moves to 4. `fast` moves to 4 (from 2 -> 3 -> 4).
*   **Meet!** `slow` and `fast` are now at the same node (4). We return `True`.

**Python Code:**
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

def hasCycle(head: ListNode) -> bool:
    # Handle edge cases: an empty list or a list with one node cannot have a cycle.
    if not head or not head.next:
        return False

    # Initialize two pointers at different speeds.
    # The slow pointer moves one step at a time.
    slow = head
    # The fast pointer moves two steps at a time.
    fast = head.next

    # Traverse the list. The loop continues as long as the pointers haven't met.
    while slow != fast:
        # If the fast pointer or its next node is None, it means we've reached
        # the end of the list, so there is no cycle.
        if not fast or not fast.next:
            return False
        
        # --- Core mechanic of the pattern ---
        # Move the pointers at their respective speeds.
        slow = slow.next
        fast = fast.next.next

    # If the loop terminates because slow == fast, a cycle was found.
    return True

```
**Complexity Analysis:**

*   **Time Complexity:** **O(N)**. Although the `fast` pointer moves twice as fast, the algorithm is still linear with respect to the number of nodes. In the worst case, the slow pointer traverses each node in the non-cyclic part and some part of the cycle before meeting the fast pointer.

*   **Space Complexity:** **O(1)**. This is the key advantage of the pattern. We only use two pointers (`slow` and `fast`) for our traversal, consuming constant extra space regardless of the list's size.

#### **4. Pattern Connection**
This problem is the quintessential example of the **Fast & Slow Pointers** pattern. The pattern is signaled when you need to analyze a sequential data structure, like a linked list, to find a structural property without using extra memory.

The key characteristics that make this pattern a perfect fit are:
1.  **A Traversal Problem:** The core task involves moving through a linked list.
2.  **A Need for Constant Space:** The brute-force solution requires O(N) space, which is often a constraint we want to optimize away.
3.  **Detecting a "Lapping" Condition:** A cycle is fundamentally a state where a traversal will eventually "lap" itself and repeat. By using pointers moving at different speeds, we can deterministically detect this lapping behavior. If one pointer ever catches up to the other, a cycle must exist.

Whenever you encounter a linked list problem asking to find the middle, detect a cycle, or find the start of a cycle, your first thought should be the Fast & Slow Pointers pattern. It transforms a space-intensive hashing problem into an elegant, constant-space pointer manipulation solution.