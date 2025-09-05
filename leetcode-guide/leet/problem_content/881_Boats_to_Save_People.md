---
### **881. Boats to Save People**
**Link to Problem:** [https://leetcode.com/problems/boats-to-save-people/](https://leetcode.com/problems/boats-to-save-people/)

#### **1. Problem Statement**
You are given an array `people` where `people[i]` is the weight of the i-th person, and a `limit` which is the maximum weight a boat can carry. Each boat can carry at most two people, provided their combined weight is not over the limit. The goal is to return the minimum number of boats required to save everyone.

#### **2. Brute Force Approach**
**Intuition:**
A straightforward but inefficient approach is to try and pair people up. We can sort the people by weight first, which usually simplifies problems involving combinations. A greedy idea is to take the heaviest person remaining and see if we can pair them with the heaviest possible partner who fits in the boat.

The logic would be:
1. Sort the `people` array in ascending order.
2. Create a boolean array `used` to keep track of who has been placed in a boat.
3. Iterate from the heaviest person down to the lightest (`i` from `n-1` to `0`).
4. If the current person `i` hasn't been used yet, they must take a new boat. Increment the boat count. Mark them as used.
5. Now, try to find a partner for them. Iterate from `i-1` down to `0` (`j`). Find the first (and therefore heaviest) unused person `j` such that `people[i] + people[j] <= limit`.
6. If a partner is found, mark them as used and break the inner loop to continue with the next heaviest person.

This approach is slow because for each person, we might have to scan a large portion of the array again to find a suitable partner.

**Python Code:**
```python
def numRescueBoats_brute_force(people: list[int], limit: int) -> int:
    # 1. Sorting helps in applying a greedy strategy.
    people.sort()
    n = len(people)
    
    # 2. 'used' array to track who has been assigned a boat.
    used = [False] * n
    boats = 0
    
    # 3. Iterate from the heaviest person to the lightest.
    for i in range(n - 1, -1, -1):
        # If this person is already in a boat with someone heavier, skip.
        if used[i]:
            continue
        
        # This person needs a boat.
        boats += 1
        used[i] = True
        
        # 4. Try to find the heaviest possible partner for this person.
        partner_found = False
        for j in range(i - 1, -1, -1):
            if not used[j] and people[i] + people[j] <= limit:
                # Found a partner, put them in the same boat.
                used[j] = True
                partner_found = True
                break # A boat can hold at most two people.
                
    return boats

```
**Complexity Analysis:**

*   **Time Complexity:** `O(N^2)`. The initial sort takes `O(N log N)`. However, the nested loops dominate. The outer loop runs `N` times, and the inner loop can also run up to `N` times in the worst case, leading to an `O(N^2)` complexity.
*   **Space Complexity:** `O(N)`. We use an additional boolean array `used` of size `N` to store the status of each person.

---

### **3. Optimized Approach: Pattern 1: Two Pointers - Converging (Sorted Array Target Sum)**
**Intuition:**
The brute-force approach is slow because of the nested search for a partner. We can optimize this by realizing a crucial greedy insight:

**The heaviest person is the most difficult to pair up.** They have the least amount of "weight capacity" remaining in their boat. If anyone can be paired with the heaviest person, it must be the lightest person.

This insight leads directly to the **Two Pointers - Converging** pattern:
1.  **Sort the array.** This allows us to easily access the lightest and heaviest people.
2.  Initialize two pointers: `left` at the start of the array (lightest person) and `right` at the end (heaviest person).
3.  In each step, we decide the fate of the heaviest person (`people[right]`). They *must* get on a boat. The only question is whether they go alone or with a partner.
4.  We check if the lightest person (`people[left]`) can fit in the boat with the heaviest person (`people[right]`).
    *   If `people[left] + people[right] <= limit`, they can share a boat. We count this boat and move both pointers inward (`left++`, `right--`).
    *   If `people[left] + people[right] > limit`, the lightest person is still too heavy to be paired with the heaviest. This implies *no one* can be paired with the heaviest person (since everyone else is heavier than `people[left]`). Therefore, the heaviest person must take a boat alone. We count this boat and move only the `right` pointer inward (`right--`).
5.  We repeat this process until the pointers cross (`left > right`), at which point everyone has been assigned a boat.

**Example Walkthrough:** `people = [3, 5, 3, 4]`, `limit = 5`
1.  **Sort:** `people` becomes `[3, 3, 4, 5]`.
2.  **Initialize:** `left = 0`, `right = 3`, `boats = 0`.
3.  **Loop 1:**
    *   Pointers: `left` at `3`, `right` at `5`.
    *   Check: `3 + 5 = 8`, which is `> limit`.
    *   Decision: The heaviest person (5) must go alone.
    *   Update: `boats = 1`, `right` moves to `2`. Pointers are now at `left=0`, `right=2`.
4.  **Loop 2:**
    *   Pointers: `left` at `3`, `right` at `4`.
    *   Check: `3 + 4 = 7`, which is `> limit`.
    *   Decision: The heaviest remaining person (4) must go alone.
    *   Update: `boats = 2`, `right` moves to `1`. Pointers are now at `left=0`, `right=1`.
5.  **Loop 3:**
    *   Pointers: `left` at `3`, `right` at `3`.
    *   Check: `3 + 3 = 6`, which is `> limit`.
    *   Decision: The heaviest remaining person (the second 3) must go alone.
    *   Update: `boats = 3`, `right` moves to `0`. Pointers are now at `left=0`, `right=0`.
6.  **Loop 4:**
    *   Pointers: `left = 0`, `right = 0`. They point to the same person (the first 3).
    *   The loop condition `left <= right` is true.
    *   This last person needs a boat.
    *   Update: `boats = 4`, `right` moves to `-1`.
7.  The loop terminates as `left > right`. Final answer: 4 boats.

**Python Code:**
```python
def numRescueBoats(people: list[int], limit: int) -> int:
    # The initial sort is the key prerequisite for the two-pointer approach.
    people.sort()
    
    # Initialize pointers at the two ends of the sorted array.
    left = 0
    right = len(people) - 1
    boats = 0
    
    # Pointers will converge towards the middle.
    while left <= right:
        # Each iteration accounts for one boat, carrying the heaviest person.
        boats += 1
        
        # Check if the lightest person can share the boat with the heaviest.
        if people[left] + people[right] <= limit:
            # If they fit, the lightest person is also on this boat.
            # Move the left pointer inward as this person is now saved.
            left += 1
        
        # The heaviest person is always on the boat in this iteration,
        # so we always move the right pointer inward.
        right -= 1
        
    return boats
```

**Complexity Analysis:**

*   **Time Complexity:** `O(N log N)`. The dominant operation is the initial sorting of the `people` array. The `while` loop runs in `O(N)` time because the `left` and `right` pointers will collectively scan the entire array exactly once.
*   **Space Complexity:** `O(1)` or `O(log N)` to `O(N)`. The space used by the algorithm itself is constant (`left`, `right`, `boats`). However, the space complexity of the sort function in most standard libraries (like Python's Timsort) can range from `O(log N)` to `O(N)`, which should be noted.

---

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers - Converging** pattern. The signals that point to this pattern are:

1.  **A Sorted Array is Beneficial:** The problem becomes much easier to reason about when the input is sorted. This allows for greedy decisions, as we can instantly access the lightest and heaviest remaining elements.
2.  **Decisions from the Extremes:** The optimal solution involves making decisions by pairing or comparing elements from the opposite ends of the sorted array (the lightest and the heaviest).
3.  **Converging Pointers:** The problem is solved by maintaining a `left` and `right` pointer that start at the ends and move towards each other, shrinking the problem space with each step until they meet or cross.
4.  **Target Condition:** The core logic `people[left] + people[right] <= limit` is a variation of the "Target Sum" sub-pattern. Instead of looking for an exact sum, we are checking if the sum falls within a certain condition (less than or equal to `limit`), which is a common task for this pattern.

By recognizing that the optimal pairing strategy involves the two extremes (heaviest and lightest), you can quickly identify that a two-pointer approach will be far more efficient than any brute-force method involving nested loops.