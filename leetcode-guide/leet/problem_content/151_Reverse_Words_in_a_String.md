---
### **151. Reverse Words in a String**
**Link to Problem:** [https://leetcode.com/problems/reverse-words-in-a-string/](https://leetcode.com/problems/reverse-words-in-a-string/)

#### **1. Problem Statement**
Given an input string `s` that contains words separated by one or more spaces, the task is to reverse the order of these words. The returned string must have only a single space separating the words and should not contain any leading or trailing spaces.

#### **2. Brute Force Approach**
**Intuition:**
The most straightforward, high-level approach is to use built-in functions provided by the programming language. The idea is to treat the string as a collection of words, reverse that collection, and then join them back into a single string.

1.  **Split:** Use a built-in `split` function to break the string into a list of words. This function conveniently handles various amounts of whitespace between words.
2.  **Reverse:** Reverse the resulting list of words.
3.  **Join:** Use a built-in `join` function to combine the words from the reversed list into a new string, using a single space as the separator.

This approach is simple and readable but relies on the language's internal implementation, which often uses extra memory to store the intermediate list of words.

**Python Code:**
```python
class Solution:
    def reverseWords(self, s: str) -> str:
        # 1. Use s.split() to handle all whitespace cases (leading, trailing, multiple).
        # It splits the string by any whitespace and returns a list of the words.
        # For example, "  hello   world  " becomes ['hello', 'world'].
        words = s.split()
        
        # 2. Reverse the list of words. Python's slice notation [::-1] is a concise
        # way to create a reversed copy of the list.
        reversed_words_list = words[::-1]
        
        # 3. Join the words in the reversed list with a single space in between.
        return " ".join(reversed_words_list)

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**, where N is the number of characters in the string. The `split()` operation takes O(N) time to iterate through the string, and the `join()` operation takes O(N) time to construct the new string. Reversing the list of words takes O(W) where W is the number of words, which is less than or equal to N.
*   **Space Complexity: O(N)**. The `split()` method creates a new list of words, which in the worst case (e.g., "a b c d e") can contain roughly N/2 elements, storing all characters of the original string. The final joined string also requires O(N) space.

### **3. Optimized Approach: Two Pointers - String Reversal**
**Intuition:**
To optimize, especially in terms of avoiding built-in functions that hide complexity and potentially use more space, we can use the **Two Pointers** pattern. Instead of splitting the string into a list first, we can build the result by iterating through the string from right to left.

The strategy is as follows:
1.  Initialize an empty list, `result`, which will store the words in their new, reversed order.
2.  Use a pointer `i` to scan the input string `s` from the end (`len(s) - 1`) towards the beginning.
3.  As we scan, we skip any trailing spaces. When we encounter the first non-space character, we know it's the end of a word. Let's mark this position as `end`.
4.  From `end`, we continue scanning leftwards with `i` to find the beginning of that same word (i.e., until we hit a space or the start of the string).
5.  Once we find the start, we have identified a complete word. We slice this word from the original string and append it to our `result` list.
6.  We repeat this process until the pointer `i` has scanned the entire string.
7.  Finally, we join the words in the `result` list with a single space.

Let's walk through an example: `s = "the sky is blue"`

1.  `result = []`, `i` starts at index 12 (`e`).
2.  `i` is at a character. `end` is 12.
3.  Scan left: `i` moves past `e`, `u`, `l`, `b`. At `i=8` (` `), we stop. The word is `s[9:13]` which is "blue".
4.  Append "blue" to `result`. Now `result = ["blue"]`.
5.  `i` continues scanning left, skipping the space at index 8.
6.  `i` is at index 7 (`s`). `end` is 7. Scan left: `i` moves past `s`, `i`. At `i=5` (` `), we stop. The word is `s[6:8]` which is "is".
7.  Append "is" to `result`. Now `result = ["blue", "is"]`.
8.  This continues until we have processed all words. `result` becomes `["blue", "is", "sky", "the"]`.
9.  Join `result`: `"blue is sky the"`.

**Python Code:**
```python
class Solution:
    def reverseWords(self, s: str) -> str:
        # A list to store the words in reversed order
        reversed_words = []
        
        # The main pointer `i` scans from the end of the string
        i = len(s) - 1
        
        while i >= 0:
            # First, skip any trailing spaces for the current word we are looking for
            if s[i] == ' ':
                i -= 1
                continue
            
            # Now `i` is at the last character of a word.
            # We use another pointer, `end`, to mark this position.
            end = i
            
            # Move `i` to the left to find the start of the current word
            while i >= 0 and s[i] != ' ':
                i -= 1
                
            # A word has been found between `i+1` and `end`.
            # Slice the string to get the word and append it.
            reversed_words.append(s[i + 1 : end + 1])
            
        # Join the collected words with a single space.
        return " ".join(reversed_words)

```
**Complexity Analysis:**

*   **Time Complexity: O(N)**. Although there is a nested `while` loop, the pointer `i` traverses the string from right to left only once. Each character is visited a constant number of times in total across both loops. Therefore, the complexity remains linear.
*   **Space Complexity: O(N)**. We use a list, `reversed_words`, to store the words we find. In the worst-case scenario where the string is composed of single-character words (e.g., "a b c"), the space required for the list and the final output string is proportional to the length of the input string `s`.

#### **4. Pattern Connection**
This problem is a quintessential example of the **Two Pointers** pattern, specifically for string manipulation. The key signal for this pattern is the need to parse or process a sequence (a string in this case) by defining and manipulating sub-sequences (words).

Instead of a brute-force split that creates an intermediate data structure for all words at once, the two-pointer approach processes the string on the fly. We use a primary scanning pointer (`i`) and a temporary marker pointer (`end`) to define the boundaries of each word (`i+1` to `end`). This "sliding window" or "segment definition" created by the pointers is the core of the pattern. It allows us to partition the problem efficiently, handling one segment (word) at a time without needing to pre-process the entire string into a list, showcasing a more memory-aware and fundamental algorithmic technique.