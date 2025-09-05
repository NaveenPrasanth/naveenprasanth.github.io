---
### **2337. Move Pieces to Obtain a String**
**Link to Problem:** [https://leetcode.com/problems/move-pieces-to-obtain-a-string/](https://leetcode.com/problems/move-pieces-to-obtain-a-string/)

#### **1. Problem Statement**
You are given two strings, `start` and `target`, of equal length, consisting of characters 'L', 'R', and '_'. An 'L' can only move left into an empty space ('_'), and an 'R' can only move right into an empty space. The pieces can't jump over each other. Determine if it's possible to transform `start` into `target` by making any number of valid moves.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward idea is to first verify the fundamental invariants of the problem. Since pieces ('L' and 'R') cannot jump over each other, their relative order must be identical in both the `start` and `target` strings. For example, if `start` has the pieces "LRL" in that order, `target` must also have "LRL" as its sequence of pieces.

A simple way to check this is to extract all non-`_` characters from both strings and see if the resulting sequences are identical. If they are, we then need to check if each individual move is valid. We can create a list of pieces and their original indices for both strings and then compare them one by one.

The logic is:
1.  Filter out the '_' characters from `start` and `target` to get the sequences of pieces. If these sequences are not identical, return `False`.
2.  If the sequences match, gather the index of each piece in `start` and `target`.
3.  For each corresponding piece (e.g., the first 'L' in `start` and the first 'L' in `target`), check if the move is valid:
    *   If the piece is 'L', its index in `start` must be greater than or equal to its index in `target`.
    *   If the piece is 'R', its index in `start` must be less than or equal to its index in `target`.
4.  If all corresponding pieces satisfy these conditions, return `True`.

**Python Code:**
```python
def canChange_brute_force(start: str, target: str) -> bool:
    # Step 1: Check if the sequence of pieces is the same.
    # By filtering out the '_' characters, we ensure the relative order of 'L' and 'R' is preserved.
    if start.replace('_', '') != target.replace('_', ''):
        return False

    # Step 2: Gather indices for each piece in both strings.
    start_L_indices = [i for i, char in enumerate(start) if char == 'L']
    start_R_indices = [i for i, char in enumerate(start) if char == 'R']
    
    target_L_indices = [i for i, char in enumerate(target) if char == 'L']
    target_R_indices = [i for i, char in enumerate(target) if char == 'R']

    # Step 3: Check move validity for every 'L' piece.
    # The k-th 'L' in start must correspond to the k-th 'L' in target.
    # An 'L' can only move left, so its start index must be >= its target index.
    for i in range(len(start_L_indices)):
        if start_L_indices[i] < target_L_indices[i]:
            return False
            
    # Step 4: Check move validity for every 'R' piece.
    # An 'R' can only move right, so its start index must be <= its target index.
    for i in range(len(start_R_indices)):
        if start_R_indices[i] > target_R_indices[i]:
            return False

    # If all checks pass, the transformation is possible.
    return True

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**, where N is the length of the strings. The `replace` operations take O(N), and the list comprehensions and loops each iterate through the strings or the derived lists once, resulting in a linear time complexity.
*   **Space Complexity: O(N)**. In the worst case, the strings consist of only 'L's and 'R's, so the lists of indices (`start_L_indices`, etc.) would store up to N indices, leading to linear space usage.

---
### **3. Optimized Approach: Two Pointers - Corresponding Scan**
**Intuition:**
The brute-force approach works, but it requires multiple passes over the string and uses extra space to store indices. We can optimize this by processing both strings in a single pass using two pointers. This avoids the need for intermediate data structures.

Let's use one pointer, `p1`, for the `start` string and another, `p2`, for the `target` string. Our goal is to find the *k*-th piece in `start` and the *k*-th piece in `target` simultaneously and compare them.

The logic is as follows:
1.  Initialize `p1 = 0` and `p2 = 0`.
2.  Use a loop that continues as long as we have characters to process in either string.
3.  Inside the loop, advance `p1` until it points to a non-`_` character in `start`.
4.  Similarly, advance `p2` until it points to a non-`_` character in `target`.
5.  Now, we have found a corresponding pair of pieces (or reached the end of one or both strings).
    *   **Check Character Match:** The pieces must be the same (`start[p1] == target[p2]`). If not, the relative order is broken. Return `False`. (Note: This also handles the case where one string runs out of pieces before the other, as the characters being compared will be different).
    *   **Check Move Validity:**
        *   If the character is `'L'`, `p1` must be `>= p2`. An 'L' cannot move to the right.
        *   If the character is `'R'`, `p1` must be `<= p2`. An 'R' cannot move to the left.
    *   If any check fails, return `False`.
6.  If the checks pass, we've successfully validated this pair of pieces. Move both pointers forward (`p1++`, `p2++`) to search for the next pair.
7.  If the loop completes without returning `False`, it means all pieces were matched and all moves were valid. Return `True`.

**Example:** `start = "_L_R_"` , `target = "L__R_"`
- `p1=0`, `p2=0`
- **Find first piece:** Advance `p1` to 1 (`start[1]=='L'`). `p2` is already at 0 (`target[0]=='L'`).
- **Compare:** Pieces match ('L'). `p1(1) >= p2(0)` is true for 'L'. All good. Advance both. `p1=2, p2=1`.
- **Find second piece:** Advance `p1` to 3 (`start[3]=='R'`). Advance `p2` to 3 (`target[3]=='R'`).
- **Compare:** Pieces match ('R'). `p1(3) <= p2(3)` is true for 'R'. All good. Advance both. `p1=4, p2=4`.
- **End:** Both pointers scan to the end of the strings. The loop finishes. Return `True`.

**Python Code:**
```python
def canChange(start: str, target: str) -> bool:
    n = len(start)
    p1, p2 = 0, 0

    # The two pointers, p1 and p2, will scan through start and target respectively.
    while p1 < n or p2 < n:
        # Core of the two-pointer pattern: advance each pointer to the next meaningful element.
        # Here, a meaningful element is a non-'_' character.
        while p1 < n and start[p1] == '_':
            p1 += 1
        while p2 < n and target[p2] == '_':
            p2 += 1

        # If we've reached the end of both strings, all pieces matched successfully.
        if p1 == n and p2 == n:
            return True
        # If one pointer reaches the end but the other hasn't, the number of pieces is different.
        if p1 == n or p2 == n:
            return False

        # Check 1: The sequence of pieces must be the same.
        # If the characters at the pointers don't match, the transformation is impossible.
        if start[p1] != target[p2]:
            return False

        # Check 2: The move must be valid based on the piece type.
        # For 'L', it can only move left.
        if start[p1] == 'L':
            if p1 < p2:
                return False
        # For 'R', it can only move right.
        elif start[p1] == 'R':
            if p1 > p2:
                return False
        
        # This pair of pieces is valid, so move to the next ones.
        p1 += 1
        p2 += 1
        
    return True
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**. Each pointer, `p1` and `p2`, traverses its respective string exactly once from left to right. Therefore, the overall time complexity is linear.
*   **Space Complexity: O(1)**. We only use a few variables (`p1`, `p2`, `n`) to store pointers and the length. No extra space proportional to the input size is used, which is a significant improvement over the previous approach.

---
#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers** pattern, specifically for comparing or verifying properties between two sequences. The problem's constraints—that pieces cannot cross each other—imply that the *relative order* of the pieces must be conserved.

The key signal for this pattern is the need to check **corresponding elements** across two arrays or strings. The first 'L' in `start` must map to the first 'L' in `target`, the second 'R' to the second 'R', and so on. A naive approach might involve searching for each element, leading to inefficiency. The Two Pointers technique elegantly solves this by creating a synchronized, single-pass traversal. Pointers `p1` and `p2` effectively track the *k*-th piece in each string simultaneously, allowing for direct comparison of their types and positions in O(N) time and O(1) space. Whenever a problem requires you to verify that one sequence can be transformed into another while maintaining the relative order of key elements, the Two Pointers pattern should be your first thought.