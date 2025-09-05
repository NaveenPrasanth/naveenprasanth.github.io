---
### **345. Reverse Vowels of a String**
**Link to Problem:** [https://leetcode.com/problems/reverse-vowels-of-a-string/](https://leetcode.com/problems/reverse-vowels-of-a-string/)

#### **1. Problem Statement**
Given a string `s`, the task is to reverse the positions of only the vowels within the string. All consonants must remain in their original positions. The vowels are 'a', 'e', 'i', 'o', 'u', and their uppercase counterparts.

#### **2. Brute Force Approach**
**Intuition:**
The most direct way to solve this is to treat it as two separate problems: first, find all the vowels, and second, place them back into the string in reversed order.

1.  **Extract:** Iterate through the input string and store all the vowels in a separate list.
2.  **Reverse:** Reverse this new list of vowels.
3.  **Replace:** Iterate through the original string again. When we encounter a position that originally held a vowel, we replace it with the next vowel from our reversed list.

This approach correctly solves the problem but requires multiple passes over the string and extra storage for the vowels.

**Python Code:**
```python
def reverseVowels_brute_force(s: str) -> str:
    # A set for O(1) vowel checking.
    vowels_set = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'}
    
    # 1. Extract all vowels from the string in the order they appear.
    extracted_vowels = []
    for char in s:
        if char in vowels_set:
            extracted_vowels.append(char)
            
    # 2. Reverse the list of extracted vowels.
    # This prepares them to be placed back in reverse order.
    extracted_vowels.reverse()
    
    # Convert the immutable string to a list of characters for modification.
    s_list = list(s)
    
    # 3. Replace the original vowel positions with the reversed vowels.
    vowel_idx = 0
    for i in range(len(s_list)):
        if s_list[i] in vowels_set:
            s_list[i] = extracted_vowels[vowel_idx]
            vowel_idx += 1
            
    # Join the list back into a string.
    return "".join(s_list)

# Example:
# s = "hello"
# extracted_vowels = ['e', 'o']
# reversed vowels = ['o', 'e']
# s_list = ['h', 'e', 'l', 'l', 'o']
# First vowel at index 1 is replaced with 'o'.
# Second vowel at index 4 is replaced with 'e'.
# Result: ['h', 'o', 'l', 'l', 'e'] -> "holle"
```
**Complexity Analysis:**

*   **Time Complexity: O(N)**, where N is the length of the string. We perform two separate full iterations over the string: one to extract vowels and one to replace them.
*   **Space Complexity: O(V)**, where V is the number of vowels in the string. In the worst-case scenario (a string of all vowels), this becomes **O(N)**, as we need to store all the vowels in the `extracted_vowels` list.

---
### **3. Optimized Approach: [Pattern 7: Two Pointers - String Reversal]**
**Intuition:**
The brute-force method is inefficient because it uses extra space to store the vowels and requires multiple passes. We can optimize this by performing the swaps in-place using two pointers that converge toward the center of the string. This is the classic "Two Pointers - String Reversal" pattern.

1.  Initialize a `left` pointer at the beginning of the string (`0`) and a `right` pointer at the end (`len(s) - 1`).
2.  The pointers will move towards each other, looking for vowels.
3.  If the character at `left` is not a vowel, we leave it alone and move the pointer forward (`left += 1`).
4.  Similarly, if the character at `right` is not a vowel, we leave it and move the pointer backward (`right -= 1`).
5.  When both `left` and `right` point to vowels, we have found a pair to swap. We swap the characters at these two positions. After swapping, we move both pointers inward (`left += 1`, `right -= 1`) to continue searching for the next pair.
6.  This process continues until the `left` pointer crosses the `right` pointer, ensuring all vowel pairs have been reversed.

Let's walk through an example: `s = "leetcode"`

*   `s_list = ['l', 'e', 'e', 't', 'c', 'o', 'd', 'e']`
*   `left = 0`, `right = 7`
*   `s_list[left]` ('l') is a consonant. Move `left` to 1.
*   `s_list[left]` ('e') is a vowel. `s_list[right]` ('e') is a vowel. They are a pair!
*   Swap `s_list[1]` and `s_list[7]`. String remains `['l', 'e', 'e', 't', 'c', 'o', 'd', 'e']`.
*   Move pointers: `left` becomes 2, `right` becomes 6.
*   `s_list[left]` ('e') is a vowel.
*   `s_list[right]` ('d') is a consonant. Move `right` to 5.
*   `s_list[left]` ('e') is a vowel. `s_list[right]` ('o') is a vowel. They are a pair!
*   Swap `s_list[2]` and `s_list[5]`. String becomes `['l', 'e', 'o', 't', 'c', 'e', 'd', 'e']`.
*   Move pointers: `left` becomes 3, `right` becomes 4.
*   `s_list[left]` ('t') is a consonant. Move `left` to 4.
*   Now `left` (4) is not less than `right` (4). The loop terminates.
*   Join the list to get the final result: `"leotcede"`.

**Python Code:**
```python
def reverseVowels(s: str) -> str:
    # A set for O(1) vowel checking is highly efficient.
    vowels_set = {'a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U'}
    
    # Python strings are immutable, so we work with a list of characters.
    s_list = list(s)
    
    # Initialize two pointers at the start and end of the list.
    left, right = 0, len(s_list) - 1
    
    # The loop continues as long as the pointers haven't crossed.
    while left < right:
        # Move the left pointer inward until it lands on a vowel.
        while left < right and s_list[left] not in vowels_set:
            left += 1
        
        # Move the right pointer inward until it lands on a vowel.
        while left < right and s_list[right] not in vowels_set:
            right -= 1
            
        # If the pointers haven't crossed, we've found two vowels to swap.
        if left < right:
            # Perform the swap.
            s_list[left], s_list[right] = s_list[right], s_list[left]
            
            # Move both pointers inward to continue the search.
            left += 1
            right -= 1
            
    # Join the list of characters back into a final string.
    return "".join(s_list)
```

**Complexity Analysis:**

*   **Time Complexity: O(N)**. Although we have nested `while` loops, each pointer (`left` and `right`) traverses the list at most once. The total number of operations is proportional to the length of the string, N.
*   **Space Complexity: O(N)**. This is specific to Python because strings are immutable and we must convert the string to a list of characters to perform the in-place swaps. In languages with mutable strings (like C++ or Java using a `char` array), the space complexity would be **O(1)**.

---
### **4. Pattern Connection**
This problem is a canonical example of the **Two Pointers - String Reversal** pattern (also known as converging or opposing pointers). The key signals for using this pattern are:

1.  **In-place Modification:** The problem asks to modify a sequence (like an array or string) without using significant extra storage.
2.  **Symmetrical Processing:** The operation involves pairing elements from the opposite ends of the sequence. Here, we need to swap the first vowel with the last, the second vowel with the second-to-last, and so on.
3.  **Conditional Logic:** The pointers don't just move one step at a time; they "seek" the next element that meets a specific condition (being a vowel) before performing an action (the swap).

The two-pointer technique elegantly handles the requirement of leaving consonants untouched by simply skipping over them. It transforms a multi-pass, high-storage problem into a single-pass, in-place solution, which is the hallmark of an efficient pointer-based algorithm.