---
### **202. Happy Number**
**Link to Problem:** [https://leetcode.com/problems/happy-number/](https://leetcode.com/problems/happy-number/)

#### **1. Problem Statement**
Given a positive integer `n`, determine if it is a "happy number." A number is happy if the process of repeatedly replacing it with the sum of the squares of its digits eventually leads to the number 1. If the process enters a repeating cycle that does not include 1, the number is not happy. The function should return `True` if `n` is happy, and `False` otherwise.

#### **2. Brute Force Approach**
**Intuition:**
The core of this problem is detecting whether the sequence of numbers generated ever repeats itself. If we generate a number we've already seen, we have detected a cycle. The most straightforward way to keep track of the numbers we've already encountered is to use a hash set (or any data structure with fast lookups).

The process is as follows:
1. Start with the given number `n`.
2. In a loop, calculate the next number in the sequence (the sum of the squares of the digits).
3. Before calculating the next number, check if the current number is already in our set of seen numbers.
    * If it is, we've found a cycle. Since we haven't reached 1 yet, this must be an unhappy cycle, so we return `False`.
    * If it isn't, we add the current number to our set and continue.
4. The loop terminates if the number becomes 1 (a happy number) or if a cycle is detected.

**Python Code:**
```python
def isHappy(n: int) -> bool:
    # A set to store numbers we have already seen in the sequence.
    # This is crucial for detecting a cycle.
    seen_numbers = set()

    # The loop continues as long as n is not 1.
    # If we encounter a number already in `seen_numbers`, we've found a cycle.
    while n != 1 and n not in seen_numbers:
        # Add the current number to our record before calculating the next one.
        seen_numbers.add(n)
        
        # Calculate the sum of the squares of the digits.
        sum_of_squares = 0
        current_n = n
        while current_n > 0:
            digit = current_n % 10
            sum_of_squares += digit * digit
            current_n //= 10
        
        # Update n to be the next number in the sequence.
        n = sum_of_squares
        
    # After the loop, if n is 1, it's a happy number.
    # If the loop exited because n was found in `seen_numbers`, n will not be 1.
    return n == 1

```
**Complexity Analysis:**

*   **Time Complexity: O(log n)**
    The time complexity is not dependent on the number of integers we have to check, but rather the "length" of the sequence for a given `n`. The number of digits in `n` is approximately `log10(n)`. Calculating the sum of squares for a number `k` takes `O(log k)` time. The sequence of numbers does not grow infinitely; it is proven that any unhappy number will eventually enter the cycle `4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4`. Thus, the number of steps is bounded by a constant after the initial calculation, leading to an effective `O(log n)` complexity dominated by the initial, larger numbers.

*   **Space Complexity: O(log n)**
    The space complexity is determined by the `seen_numbers` set. In the worst case, we store a number of values proportional to the number of steps it takes to find a cycle. As with time complexity, this is related to the magnitude of the numbers processed, resulting in `O(log n)` space.

---

### **3. Optimized Approach: Two Pointers - Fast & Slow (Cycle Detection)**
**Intuition:**
The hash set approach works, but it requires extra space. We can optimize this by realizing that the problem is fundamentally about **cycle detection in a sequence**. This is a classic use case for Floyd's Cycle-Finding Algorithm, also known as the "Tortoise and the Hare" or **Fast & Slow Pointer** algorithm.

Imagine the sequence of numbers (`n_0`, `n_1`, `n_2`, ...) as a linked list where each number is a node and the "sum of squared digits" function is the `next` pointer.
- `n_1 = get_next(n_0)`
- `n_2 = get_next(n_1)`

We can use two pointers to traverse this conceptual list:
1.  A `slow` pointer that moves one step at a time (`slow = get_next(slow)`).
2.  A `fast` pointer that moves two steps at a time (`fast = get_next(get_next(fast))`).

If there is no cycle, the `fast` pointer will reach the end (in our case, the number 1) first. If there *is* a cycle, the `fast` pointer will eventually enter the cycle and lap the `slow` pointer, meaning they will point to the same number at some point.

**Example Walkthrough (n = 19):**
- **Helper function:** `get_next(num)` calculates the sum of the squares of digits. `get_next(19) = 1² + 9² = 82`.
- **Initial State:** `slow = 19`, `fast = 19`.
- **Iteration 1:**
    - `slow` moves 1 step: `slow = get_next(19) = 82`.
    - `fast` moves 2 steps: `fast = get_next(get_next(19)) = get_next(82) = 68`.
    - `slow` (82) != `fast` (68).
- **Iteration 2:**
    - `slow` moves 1 step: `slow = get_next(82) = 68`.
    - `fast` moves 2 steps: `fast = get_next(get_next(68)) = get_next(100) = 1`.
    - `slow` (68) != `fast` (1).
- **Termination:** The `fast` pointer has reached 1. We exit the loop and check if `fast == 1`. It is, so we return `True`.

**Python Code:**
```python
def isHappy(n: int) -> bool:
    
    def get_next(number: int) -> int:
        """Helper function to compute the sum of the squares of the digits."""
        total_sum = 0
        while number > 0:
            digit = number % 10
            total_sum += digit * digit
            number //= 10
        return total_sum

    # Initialize two pointers starting from the original number.
    slow_runner = n
    fast_runner = get_next(n)

    # The loop continues as long as the fast runner hasn't reached 1
    # and the two pointers haven't met.
    while fast_runner != 1 and slow_runner != fast_runner:
        # Slow pointer moves one step.
        slow_runner = get_next(slow_runner)
        # Fast pointer moves two steps.
        fast_runner = get_next(get_next(fast_runner))

    # If the loop terminated, one of two conditions was met:
    # 1. fast_runner == 1: We found the happy number termination.
    # 2. slow_runner == fast_runner: A cycle was detected. Since fast_runner is not 1,
    #    it must be an unhappy cycle.
    return fast_runner == 1

```
**Complexity Analysis:**

*   **Time Complexity: O(log n)**
    The time complexity remains the same as the hash set approach. The number of steps until the pointers meet or reach 1 is bounded, and each step's calculation takes `O(log k)` time for a number `k`.

*   **Space Complexity: O(1)**
    This is the key improvement. We are no longer storing a history of seen numbers. We only use a fixed number of variables (`slow_runner`, `fast_runner`) to solve the problem, regardless of the input size. This gives us constant space complexity.

---

#### **4. Pattern Connection**
This problem is a quintessential example of the **Fast & Slow Pointer** pattern for cycle detection, even though it doesn't involve an explicit linked list data structure.

The signal to use this pattern arises when you have a sequence generated by repeatedly applying a function (`n -> f(n) -> f(f(n)) -> ...`), and you need to determine if this sequence ever enters a repeating cycle.

The key characteristics of the "Happy Number" problem that point to this pattern are:
1.  **A Sequence of States:** The problem is defined by a sequence of numbers, where each number is derived from the previous one.
2.  **Two Possible Endings:** The sequence either terminates at a specific value (1) or falls into a loop.
3.  **The Need for Cycle Detection:** The core task is to distinguish between these two outcomes, which is precisely what cycle detection algorithms are for.

By conceptualizing the numbers as nodes and the transformation function as the `next` pointer, the problem becomes identical to "Linked List Cycle II". The Fast & Slow Pointer approach provides a highly efficient, `O(1)` space solution, making it the optimal way to solve problems with this underlying structure.