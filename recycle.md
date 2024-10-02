## Quiz

```js
let black = { rgb: 0xffffff };
let white = { rgb: 0x000000 };

swap(black, white);

console.log(black.rgb, white.rgb);

function swap(p, q) {
    p = q;
    q = p;
}
```

- What does the above program log?
  - 0 0
  - 0 16777215
  - 16777215 0
  - 16777215 16777215
- Many programmers get this wrong because they confuse:
  - “reference types” with
  - “pass by reference”

### Value/reference types

<table>
<tr>
<th>C# value types</th>
<th>C# reference types</th>
</tr>
<tr>
<td>

```csharp
//////
struct Color
{
    public int rgb;
}
//  4 bytes
Color black = new Color();
Color white = black;
//  4 bytes

white.rgb = 0xffffff;

Console.WriteLine(black.rgb); // 0
Console.WriteLine(white.rgb); // 16777215
```

- `Color` variable contains `Color` object
- `white = black` copies `Color` object
- no Garbage Collection involved

</td>
<td>

```csharp
/////
class Color
{
    public int rgb;
}
//  8 bytes   ~16 bytes
Color black = new Color();
Color white = black;
//  8 bytes     0 bytes

white.rgb = 0xffffff;

Console.WriteLine(black.rgb); // 16777215
Console.WriteLine(white.rgb); // 16777215
```

- `Color` variable contains *reference* to `Color` object
- `white = black` copies `Color` *reference*
- generally requires Garbage Collection

</td>
</tr>
</table>

#### JavaScript

```js
let black = { rgb: 0x000000 };
let white = black;

white.rgb = 0xffffff;

console.log(black.rgb); // 16777215
console.log(white.rgb); // 16777215
```

- All non-primitive JavaScript types are reference types:
  - `Object`
  - `Array`
  - `Function`
  - ...
- 👨‍🏫 JavaScript objects are *never* implicitly copied!
  - only object references

## Functions

### Pass by value/reference

<table>
<tr>
<th>C# pass by value</th>
<th>C# pass by reference</th>
</tr>
<tr>
<td>

```csharp
void swap<T>(T p, T q)
{
    var t = p;
    p = q;
    q = t;
}

swap(a, b);   // does NOT swap a with b
```

- inlined `swap(a, b)` function call:

```csharp
// copy arguments into parameters
var p = a;
var q = b;
// swap parameters, not arguments
var t = p;
p = q;
q = t;
```

- 👨‍🏫 Pass by value is about passing a **value**
- Argument *can* be a variable ⇒ pass current value
- Parameter variable is a *copy* of its argument

</td>
<td>

```csharp
void swap<T>(ref T p, ref T q)
{            ///      ///
    var t = p;
    p = q;
    q = t;
}
     ///    ///
swap(ref a, ref b);   // DOES swap a with b
```

- inlined `swap(ref a, ref b)` function call:

```csharp
// nothing to copy


// swap arguments
var t = a;
a = b;
b = t;
```

- 👨‍🏫 Pass by reference is about passing a **variable**
- Argument *must* be a variable; value fails compilation
- Parameter and argument behave as 1 variable

</td>
</tr>
</table>

#### JavaScript

```js
function swap(p, q) {
    let t = p;
    p = q;    // mutates parameter, not argument
    q = t;    // mutates parameter, not argument
}

swap(a, b);   // does NOT swap a with b
```

- 👨‍🏫 JavaScript passes everything by value:
  - primitive values
  - object references
- Passing object references by value:
  - originated as [pass by sharing](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_sharing) in CLU (Liskov, 1974)
  - is often confused with pass by reference

| Object reference             | Pass by reference        |
| ---------------------------- | ------------------------ |
| value → **object**           | parameter → **variable** |
| potentially unbound (`null`) | guaranteedly bound       |
| generally rebindable (`=`)   | til death do us part     |
