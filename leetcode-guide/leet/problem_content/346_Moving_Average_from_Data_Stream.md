---
### **346. Moving Average from Data Stream**
**Link to Problem:** [https://leetcode.com/problems/moving-average-from-data-stream/](https://leetcode.com/problems/moving-average-from-data-stream/)

#### **1. Problem Statement**
The task is to implement a `MovingAverage` class that calculates the moving average of the last `k` numbers in a data stream. The class will be initialized with a window size `k`. Its single method, `next(val)`, adds a new integer `val` to the stream and returns the average of the last `k` elements.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward way to solve this is to store every number we've seen. Each time `next()` is called, we add the new number to our list. Then, to calculate the moving average, we identify the last `k` elements in our list, sum them up, and divide by the number of elements in that window (which could be less than `k` initially).

**Python Code:**
```python
class MovingAverage:
    def __init__(self, size: int):
        """
        Initializes the MovingAverage object.
        - self.size: The fixed size of the window.
        - self.stream: A list to store all numbers encountered so far.
        """
        self.size = size
        self.stream = []

    def next(self, val: int) -> float:
        """
        Adds a new value and calculates the moving average.
        """
        # Add the new value to our record of all numbers.
        self.stream.append(val)
        
        # Determine the slice of the stream that represents our window.
        # We use max(0, ...) to handle the case where the stream is shorter than the window size.
        window = self.stream[max(0, len(self.stream) - self.size):]
        
        # Calculate the sum of elements in the current window and divide by its size.
        return sum(window) / len(window)

# Complexity Analysis:

# Time Complexity: O(k) for each call to next().
# The dominant operation is `sum(window)`. In the worst case, the window has `k` elements,
# so calculating the sum requires iterating over all `k` of them.

# Space Complexity: O(N), where N is the total number of calls to `next()`.
# The `self.stream` list grows indefinitely, storing every single element ever passed to the method.
# This can become very memory-intensive for a long data stream.
```

### **3. Optimized Approach: [Pattern 8: Sliding Window - Fixed Size (Subarray Calculation)]**
**Intuition:**
The brute-force approach is inefficient because it recalculates the sum of the window from scratch every single time. We can do better. The key insight of the sliding window pattern is to recognize that as the window "slides" forward, we only need to account for two changes: the new element entering the window and the oldest element leaving it.

Instead of storing all `N` elements, we only need to keep track of the `k` elements currently inside the window. A `deque` (double-ended queue) is the perfect data structure for this. We can also maintain a running `window_sum`.

Let's walk through an example: `size = 3`.
1.  `next(1)`: Window `[1]`. Sum is 1. Avg = 1/1 = 1.0.
2.  `next(10)`: Window `[1, 10]`. Sum is 1+10=11. Avg = 11/2 = 5.5.
3.  `next(3)`: Window `[1, 10, 3]`. Sum is 11+3=14. Avg = 14/3 ≈ 4.67. The window is now full.
4.  `next(5)`: The window needs to slide.
    *   The new element `5` enters. We add it to our sum: `14 + 5 = 19`.
    *   The oldest element `1` must leave. We subtract it from our sum: `19 - 1 = 18`.
    *   The new window is `[10, 3, 5]`. The new average is `18 / 3 = 6.0`.

By updating the sum in O(1) time, we avoid the expensive O(k) re-summation.

**Python Code:**
```python
from collections import deque

class MovingAverage:
    def __init__(self, size: int):
        """
        Initializes the MovingAverage object.
        - self.size: The fixed size of the window.
        - self.window: A deque to efficiently store only the elements in the window.
        - self.window_sum: The running sum of elements currently in the window.
        """
        self.size = size
        self.window = deque()
        self.window_sum = 0.0

    def next(self, val: int) -> float:
        """
        Adds a new value and calculates the moving average in O(1) time.
        """
        # --- Window Expansion ---
        # A new element enters the window from the right.
        self.window.append(val)
        # Add its value to our running sum.
        self.window_sum += val
        
        # --- Window Contraction ---
        # If the window is now too large, the oldest element must be removed.
        if len(self.window) > self.size:
            # Remove the leftmost element from the window and subtract its value from the sum.
            # This is the core of the sliding window optimization.
            removed_val = self.window.popleft()
            self.window_sum -= removed_val
            
        # The average is the current sum divided by the number of elements in the window.
        return self.window_sum / len(self.window)

# Complexity Analysis:

# Time Complexity: O(1) for each call to next().
# All operations within the `next` method (`append`, `popleft`, addition, subtraction, division)
# take constant time, regardless of the window size. This is a significant improvement.

# Space Complexity: O(k), where `k` is the window size.
# The `deque` stores at most `k` elements, providing a fixed memory footprint that doesn't
# grow with the length of the data stream.
```

#### **4. Pattern Connection**
This problem is a quintessential example of the **Fixed-Size Sliding Window** pattern. The pattern is immediately identifiable by these key characteristics:

*   **Input as a Sequence:** We are processing a `data stream`, which is conceptually the same as iterating over a long array.
*   **Contiguous Subarray/Window:** The problem asks for a calculation (the average) over a contiguous block of the most recent elements.
*   **Fixed Size:** The size of this block, `k`, is defined at the start and does not change.
*   **Calculation can be Updated Efficiently:** The core of the problem is a calculation (a sum) that can be updated in O(1) time as the window slides. Instead of re-computing the sum for the entire new window, we simply add the new element and subtract the one that falls off.

Whenever you encounter a problem that requires performing a calculation on a fixed-size, contiguous segment of an array or stream, your first thought should be the fixed-size sliding window pattern. The key is to avoid redundant work by maintaining a running state (like a sum, count, or character map) and only updating it with the elements that enter and exit the window on each step.