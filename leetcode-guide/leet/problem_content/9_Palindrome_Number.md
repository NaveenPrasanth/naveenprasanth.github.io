---
### **9. Palindrome Number**
**Link to Problem:** [https://leetcode.com/problems/palindrome-number/](https://leetcode.com/problems/palindrome-number/)

#### **1. Problem Statement**
Given an integer `x`, the task is to determine if it is a palindrome. An integer is a palindrome if it reads the same forwards and backwards. The function should return `true` if it's a palindrome and `false` otherwise.

#### **2. Brute Force Approach**
**Intuition:**
The most direct way to check for palindromic properties is to convert the number into a format that allows for easy comparison from both ends. A string is the natural choice. We can convert the integer to a string and then use two pointers, one at the beginning and one at the end, moving them towards the center. If the characters at the pointers ever mismatch, we know it's not a palindrome. If the pointers meet or cross without finding any mismatches, the number is a palindrome.

**Python Code:**
```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # A negative number reads differently forwards and backwards (e.g., -121 vs 121-).
        # Therefore, no negative number can be a palindrome.
        if x < 0:
            return False

        # Convert the integer to a string to easily access its "digits" by index.
        s = str(x)
        
        # Initialize two pointers, one at the very beginning and one at the very end.
        left, right = 0, len(s) - 1
        
        # Loop until the pointers meet or cross each other.
        while left < right:
            # If the characters at the current pointers do not match, it's not a palindrome.
            if s[left] != s[right]:
                return False
            
            # Move the pointers one step closer to the center.
            left += 1
            right -= 1
            
        # If the loop completes without returning false, the number is a palindrome.
        return True

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**, where N is the number of digits in the integer `x`. Converting the integer to a string takes O(N) time. The `while` loop runs approximately N/2 times, which is also O(N). The dominant factor is O(N).
*   **Space Complexity: O(N)**. We create a string representation of the number, which requires storage space proportional to the number of digits.

### **3. Optimized Approach: Two Pointers - Expanding From Center (Palindromes)**
**Intuition:**
The brute-force solution is simple, but the problem includes a follow-up: "Could you solve it without converting the integer to a string?". This hints that we should use a mathematical approach that avoids the O(N) space cost of string conversion.

The core idea is to reverse the *second half* of the number and compare it to the *first half*. If they are identical, the number is a palindrome. We can do this arithmetically by repeatedly "popping" the last digit of the original number and "pushing" it onto a new `reverted_number`.

Let's walk through an example with `x = 1221`:
1.  Initialize `reverted_number = 0`. `x = 1221`.
2.  **Loop 1:**
    *   `reverted_number` = `0 * 10 + 1` -> `1`
    *   `x` = `1221 // 10` -> `122`
    *   Condition `x > reverted_number` (122 > 1) is true.
3.  **Loop 2:**
    *   `reverted_number` = `1 * 10 + 2` -> `12`
    *   `x` = `122 // 10` -> `12`
    *   Condition `x > reverted_number` (12 > 12) is false. The loop terminates.

At the end, we compare `x` (the remaining first half) with `reverted_number` (the reversed second half). Here, `x` (12) is equal to `reverted_number` (12), so it's a palindrome. For an odd-length number like `12321`, the loop stops when `x = 12` and `reverted_number = 123`. The middle digit (3) doesn't matter for the palindrome check, so we can discard it by comparing `x` with `reverted_number // 10`.

This approach conceptually mirrors a two-pointer technique: `x` acts as a pointer shrinking from the right, while `reverted_number` acts as another pointer building the reversed sequence.

**Python Code:**
```python
class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Edge Cases:
        # 1. Negative numbers are not palindromes.
        # 2. If the last digit is 0, the first digit must also be 0 for it to be a palindrome.
        #    The only number that satisfies this is 0 itself.
        if x < 0 or (x % 10 == 0 and x != 0):
            return False

        reverted_number = 0
        
        # We only need to revert the second half of the number.
        # The loop stops when we've processed half the digits, which is when x <= reverted_number.
        while x > reverted_number:
            # Get the last digit of x and add it to the end of reverted_number.
            last_digit = x % 10
            reverted_number = reverted_number * 10 + last_digit
            
            # Remove the last digit from x.
            x //= 10

        # After the loop, x is the first half and reverted_number is the second half.
        # Check for both even and odd length numbers:
        # - Even (e.g., 1221): loop stops when x=12, reverted_number=12. We need x == reverted_number.
        # - Odd (e.g., 12321): loop stops when x=12, reverted_number=123. The middle digit is on reverted_number.
        #   We can discard it with integer division: reverted_number // 10. We need x == reverted_number // 10.
        return x == reverted_number or x == reverted_number // 10
```
**Complexity Analysis:**

*   **Time Complexity: O(log₁₀(N))**, where N is the value of the integer. We divide the input number by 10 in each iteration, so the number of loop iterations is proportional to the number of digits in `x`, which is mathematically `log₁₀(N)`. This is a significant improvement over the O(N) string conversion approach.
*   **Space Complexity: O(1)**. We only use a few variables to store integer values, regardless of the size of the input `x`. This satisfies the "no extra space" follow-up.

#### **4. Pattern Connection**
This problem is a classic, non-obvious application of the palindrome checking logic that underpins patterns like **Expanding From Center**. While we don't use literal array indices as pointers, the core principle is the same: **verifying symmetry by comparing two halves of a sequence.**

The key signals that this pattern is relevant are:
1.  The problem explicitly asks to check for a **palindromic property** (reading the same forwards and backwards).
2.  The "no string conversion" constraint forces a mathematical solution that must **simulate the comparison of the first and second halves** of the number.

The optimized solution cleverly treats the number itself as the sequence. The variable `x` represents the shrinking first half, while `reverted_number` is the growing, reversed second half. The `while` loop runs until these two conceptual "halves" meet in the middle. This process of building one half to match the other is a numerical equivalent of the pointer-based comparison used on strings and arrays, making it a foundational example of how sequence-based patterns can be adapted to a purely arithmetic domain.