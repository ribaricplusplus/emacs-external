# Introduction

Whenever I read something from a book, I write down the notes and the name of the book. This is useful so that later on I can remind myself of the books I've read and the key lessons from them.
Categorizing books is no fun at all, thus, instead of doing that, whenever I read something from a particular source, amongs all other notes I write down
the book author and title in a particular way so that I can locate all the books I've read.

Namely, I write down the book title and first 2 authors so that it matches the following regular expression:
`\w\..*?(,\w\..*?)?:\S+?$`

It's just a particular combination of author names and book title, structured in a way that book sources can be uniquely identified among all other notes, and not mixed up with anything else.

The output of the program looks like this:

~~~
BOOK NAME AND AUTHORS
File-where-notes-about-the-book-are-1
File-where-notes-about-the-book-are-2
File-where-notes-about-the-book-are-3
=====================================
SECOND BOOK NAME AND AUTHORS
File-where-notes-about-the-book-are-1
File-where-notes-about-the-book-are-2
~~~

# Installation

`gulp install` Creates a link in the binary directory.
