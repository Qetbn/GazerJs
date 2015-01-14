# GazerJs
*User action tracking library.*

This goal of GazerJs is to create lightweight library which tracks user behavior on your page.

GazerJs consists of two parts:
* Recorder
* Player

Recorder can be used only on tracked host due browser security policies.
It tracks only following events:
* Document ready
* Window resize
* Mousemove
* Mousedown
* Scroll
* Keydown
* Change (Input, Select, Textarea)
* Focus (Input, Select, Textarea, A, Button)
* Text selection