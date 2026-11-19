// Vivi language support: completion, hover docs and signature help.
// Signatures below are taken from the real module sources (math/strings/sys/time/json .vivi).
const vscode = require('vscode');

// Docs
// Only things checked against the source are documented. Other names still complete.

const DOCS = {
  // Screen & cursor
  clear_screen: { desc: 'Clears the entire terminal screen and moves the cursor to the top-left corner (`1, 1`).' },
  clear_line: { desc: 'Erases the current line and returns the cursor to the start of that line.' },
  cursor_to: {
    desc: 'Moves the terminal cursor to a specific **1-based** `row` (top-to-bottom) and `col` (left-to-right).',
    example: 'cursor_to(1, 1)\nprintln("Top-left corner!")',
  },
  cursor_hide: { desc: 'Hides the blinking terminal cursor. Remember to call `cursor_show()` before exiting.' },
  cursor_show: { desc: 'Makes the terminal cursor visible again after calling `cursor_hide()`.' },

  // Input
  read_line: {
    desc: 'Reads a single line of text from standard input (`stdin`), including the trailing newline.',
    example: 'line := read_line()',
  },
  input: {
    desc: 'Displays `prompt` without a newline and reads a line of user input from `stdin`.',
    example: 'name := input("Enter your name: ")',
  },

  // Files
  file_read: { desc: 'Reads the entire contents of the file at `path` and returns it as a string.', example: 'content := file_read("notes.txt")' },
  file_create: { desc: 'Creates an empty file at `path` (or truncates it if it already exists).', example: 'file_create("output.log")' },
  file_write: { desc: 'Writes `text` to `path`, creating the file if needed or overwriting existing contents.', example: 'file_write("save.txt", "level=1")' },
  file_append: { desc: 'Appends `text` to the end of the file at `path`.', example: 'file_append("app.log", "Started\\n")' },
  file_exists: { desc: 'Returns `true` if the file at `path` exists and can be opened for reading, otherwise `false`.', example: 'if file_exists("config.json") {\n\tprintln("Loaded!")\n}' },
  file_lines: { desc: 'Reads the file at `path` and splits its contents into an array of lines.', example: 'for line in file_lines("data.txt") {\n\tprintln(line)\n}' },

  // Prelude (_base.vivi)
  stdout: { desc: 'Standard output file descriptor (`1`).' },
  stderr: { desc: 'Standard error file descriptor (`2`).' },
  print: { desc: 'Prints one or more space-separated values to `stdout` without a trailing newline.', example: 'print("Score:", 42)' },
  fprint: { desc: 'Writes one or more space-separated values to file descriptor `fd` without a trailing newline.', example: 'fprint(stdout, "Hello", "world")' },
  println: { desc: 'Prints one or more space-separated values to `stdout` followed by a newline.', example: 'println("Hello, Vivi!")' },
  printf: { desc: 'Prints formatted text to `stdout`. Supports `%d` (int), `%x` (hex), `%s` (string), `%c` (char/rune), and `%%`.', example: 'printf("User %s has %d pts (0x%x)\\n", name, 255, 255)' },
  fprintf: { desc: 'Writes formatted text to file descriptor `fd`. Supports `%d`, `%x`, `%s`, `%c`, and `%%`.', example: 'fprintf(stderr, "Error %d: %s\\n", code, msg)' },
  eprint: { desc: 'Prints one or more space-separated values to `stderr` without a trailing newline.', example: 'eprint("Warning: ")' },
  eprintln: { desc: 'Prints one or more space-separated values to `stderr` followed by a newline.', example: 'eprintln("Something went wrong!")' },
  eprintf: { desc: 'Prints formatted text to `stderr`. Supports `%d`, `%x`, `%s`, `%c`, and `%%`.', example: 'eprintf("Failed at line %d\\n", line)' },
  exit: { desc: 'Terminates the program with exit `code` (defaults to `0`, wrapped `mod 256`). Standard codes: `0` ok, `1` runtime, `2` parse, `127` not found, `134` panic.', example: 'exit(0)' },
  panic: { desc: 'Prints `"panic(): <str>"` along with a stack traceback, then terminates the program.', example: 'panic("invalid state reached")' },
  timestamp: { desc: 'Returns the current clock timestamp from the runtime.', example: 'start := timestamp()' },
  traceback: { desc: 'Returns the current call stack traceback.', example: 'println(traceback())' },
  malloc: { desc: 'Allocates `size` bytes of 16-byte-aligned heap memory (minimum 16 bytes) and returns a pointer to the payload.', example: 'buf := malloc(64)' },
  free: { desc: 'Frees a heap pointer previously returned by `malloc`. Panics on double-free or corrupted block headers; ignores `null`.', example: 'free(buf)' },
  memcpy: { desc: 'Copies `n` bytes of memory from `src` to `dst`.', example: 'memcpy(dst, src, 64)' },

  // ANSI
  ansi: { desc: 'Wraps `text` in an ANSI escape code (`CSI <code>m`) and automatically appends a reset sequence.', example: 'println(ansi(31, "Custom red"))' },
  rgb: { desc: 'Wraps `text` in a 24-bit truecolor foreground ANSI escape sequence (`r`, `g`, `b` from `0`–`255`).', example: 'println(rgb(255, 140, 0, "Orange text"))' },
  black: { desc: 'Styles string `s` with black foreground text.' },
  red: { desc: 'Styles string `s` with red foreground text.' },
  green: { desc: 'Styles string `s` with green foreground text.' },
  yellow: { desc: 'Styles string `s` with yellow foreground text.' },
  blue: { desc: 'Styles string `s` with blue foreground text.' },
  magenta: { desc: 'Styles string `s` with magenta foreground text.' },
  cyan: { desc: 'Styles string `s` with cyan foreground text.' },
  white: { desc: 'Styles string `s` with white foreground text.' },
  gray: { desc: 'Styles string `s` with gray (bright black) foreground text.' },
  bg_red: { desc: 'Styles string `s` with a red background.' },
  bg_green: { desc: 'Styles string `s` with a green background.' },
  bg_blue: { desc: 'Styles string `s` with a blue background.' },
  bold: { desc: 'Styles string `s` in bold text.' },
  dim: { desc: 'Styles string `s` in dimmed/faint text.' },
  italic: { desc: 'Styles string `s` in italic text.' },
  underline: { desc: 'Styles string `s` with an underline.' },
  inverse: { desc: 'Swaps the foreground and background colors of string `s`.' },

  // Strings
  index_of: { desc: 'Returns the index of the first occurrence of `substr` at or after `from`, or `-1` if not found (also `-1` for an empty `substr`).', example: 'index_of("hello", "l")  // 2' },
  is_digit: { desc: 'Returns `true` if rune `c` is an ASCII digit (`0`–`9`).', example: "is_digit('7')  // true" },
  has_prefix: { desc: 'Returns `true` if `str` starts with `prefix`.', example: 'has_prefix("vivi", "vi")  // true' },
  has_suffix: { desc: 'Returns `true` if `str` ends with `suffix`.', example: 'has_suffix("vivi", "vi")  // true' },
  contains: { desc: 'Returns `true` if `substr` occurs anywhere in `str`. An empty `substr` always matches.', example: 'contains("hello", "ell")  // true' },
  substring: { desc: 'Returns the characters from `start` (inclusive) to `end` (exclusive). Both default to the string bounds, are clamped to the string, and are swapped if `start > end`.', example: 'substring("hello", 1, 3)  // "el"' },
  split: { desc: 'Splits `str` on `delimiter` into an array. With no delimiter it splits into single characters. Panics on an empty string.', example: 'parts := split("a,b,c", ",")' },
  join: { desc: 'Concatenates two strings. Identical to `str1 ~ str2`; kept for people coming from JS.', example: 'join("foo", "bar")  // "foobar"' },
  replace: { desc: 'Replaces the **first** occurrence of `target` in `str` with `replacement`.', example: 'replace("a-b-c", "-", "+")  // "a+b-c"' },
  trim: { desc: 'Removes leading and trailing spaces, tabs, newlines and carriage returns.', example: 'trim("  hi \\n")  // "hi"' },
  to_upper: { desc: 'Converts ASCII letters in `str` to upper case.', example: 'to_upper("vivi")  // "VIVI"' },
  to_lower: { desc: 'Converts ASCII letters in `str` to lower case.', example: 'to_lower("VIVI")  // "vivi"' },
  reverse: { desc: 'Returns `str` with its characters in reverse order.', example: 'reverse("abc")  // "cba"' },
  to_pascal_case: { desc: 'Splits on spaces and capitalizes each word, lowering the rest: `"hello world"` becomes `"HelloWorld"`.' },
  to_camel_case: { desc: 'Like `to_pascal_case`, but the first word stays lower case: `"hello world"` becomes `"helloWorld"`.' },
  to_snake_case: { desc: 'Lower-cases `str` and replaces spaces with underscores: `"Hello World"` becomes `"hello_world"`.' },

  // Math constants
  pi: { desc: 'π ≈ 3.14159.' },
  e: { desc: "Euler's number ≈ 2.71828." },
  phi: { desc: 'The golden ratio ≈ 1.61803.' },
  tau: { desc: 'τ = 2π.' },
  inf: { desc: 'Positive infinity (`1 / 0`).' },
  nan: { desc: 'Not-a-number (`0 / 0`).' },
  epsilon: { desc: 'Convergence tolerance used by the series functions (`1e-12`).' },
  ln2: { desc: 'Natural log of 2.' },
  ln10: { desc: 'Natural log of 10.' },

  // Math functions
  abs: { desc: 'Absolute value of `x`.' },
  min: { desc: 'The smaller of `a` and `b`.' },
  max: { desc: 'The larger of `a` and `b`.' },
  clamp: { desc: 'Restricts `x` to the range `[low, high]`.', example: 'clamp(15, 0, 10)  // 10' },
  lerp: { desc: 'Linear interpolation: `a + (b - a) * t`.' },
  sign: { desc: 'Returns `1`, `-1` or `0` depending on the sign of `x`.' },
  copysign: { desc: 'Magnitude of `x` with the sign of `y`.' },
  trunc: { desc: 'Drops the fractional part of `x` (rounds toward zero). Returns a float.' },
  floor: { desc: 'Largest whole number less than or equal to `x`.' },
  ceil: { desc: 'Smallest whole number greater than or equal to `x`.' },
  round: { desc: 'Rounds to the nearest whole number; exact halves round to the nearest **even** number.' },
  fmod: { desc: 'Floating-point remainder of `x / y` (truncated division).' },
  modf: { desc: 'Splits `x` into `[fractional, integer]` parts.', example: 'parts := modf(3.25)  // [0.25, 3.0]' },
  sqrt: { desc: 'Square root of `x` (Newton iteration). Panics if `x < 0`.' },
  cbrt: { desc: 'Cube root of `x` (Newton iteration).' },
  hypot: { desc: 'Length of the hypotenuse, `sqrt(a² + b²)`, computed without overflow.' },
  pow: { desc: '`base` raised to `exponent`. Returns `nan` for a negative base with a fractional exponent; panics on `0` to a negative power.' },
  exp: { desc: 'e raised to the power `x`. Returns `inf` above 700 and `0` below -700.' },
  expm1: { desc: '`exp(x) - 1`, accurate for small `x`.' },
  log: { desc: 'Natural logarithm of `x`. Panics if `x <= 0`.' },
  log10: { desc: 'Base-10 logarithm of `x`.' },
  log2: { desc: 'Base-2 logarithm of `x`.' },
  sin: { desc: 'Sine of `x` (radians).' },
  cos: { desc: 'Cosine of `x` (radians).' },
  tan: { desc: 'Tangent of `x` (radians). Panics where undefined.' },
  asin: { desc: 'Arcsine of `x`, in radians. Panics if `|x| > 1`.' },
  acos: { desc: 'Arccosine of `x`, in radians.' },
  atan: { desc: 'Arctangent of `x`, in radians.' },
  atan2: { desc: 'Angle of the point `(x, y)` in radians, taking the quadrant into account.' },
  sinh: { desc: 'Hyperbolic sine.' },
  cosh: { desc: 'Hyperbolic cosine.' },
  tanh: { desc: 'Hyperbolic tangent.' },
  asinh: { desc: 'Inverse hyperbolic sine.' },
  acosh: { desc: 'Inverse hyperbolic cosine. Panics if `x < 1`.' },
  atanh: { desc: 'Inverse hyperbolic tangent. Panics if `|x| >= 1`.' },
  deg_to_rad: { desc: 'Converts degrees to radians.' },
  rad_to_deg: { desc: 'Converts radians to degrees.' },
  gcd: { desc: 'Greatest common divisor of `a` and `b`.' },
  lcm: { desc: 'Least common multiple of `a` and `b`.' },
  factorial: { desc: '`n!`. Panics if `n < 0`.' },
  gamma: { desc: 'Gamma function (Lanczos approximation). Panics at poles (`0` and negative integers).' },
  erf: { desc: 'Error function (approximation).' },
  erfc: { desc: 'Complementary error function, `1 - erf(x)`.' },

  // Sys
  run: { desc: "Runs `cmd` with the script's own stdin/stdout/stderr and returns its exit code.", example: 'code := run("ls -la")' },
  capture: { desc: 'Runs `cmd` and returns `[exit code, stdout as a string]`.', example: 'res := capture("date")\nprintln(res[1])' },
  feed: { desc: 'Runs `cmd` with `text` as its stdin and returns the exit code.', example: 'feed("wc -l", "a\\nb\\nc\\n")' },
  pipe: { desc: 'Runs `left | right` and returns the exit code of `right`.', example: 'pipe("ls", "wc -l")' },
  redirect: { desc: 'Runs `cmd > path` (stdout and stderr both go to the file) and returns the exit code.', example: 'redirect("ls", "out.txt")' },

  // Time
  program_start: { desc: 'The timestamp taken when the time module was loaded.' },
  now: { desc: 'Current timestamp as an `i32`.' },
  dt: { desc: 'Returns `(c - last_time) * 1000` and then records `c` as the new `last_time`, so each call measures the gap since the previous one.', example: 'delta := dt()' },
  dateTime: { desc: 'Converts a timestamp (plus `base_offset` hours) into `[day, month, year]`. `month` is **1-based**.', example: 'd := dateTime()\nprintln(d[0], d[1], d[2])' },
  getTime: { desc: 'Returns `[hours, minutes, seconds, meridiem]` for a timestamp, applying `base_offset` hours plus US daylight saving. `zulu` selects 24-hour (`true`) or AM/PM (`false`).', example: 'getTime(now(), -6, false)' },
  getDay: { desc: 'Returns the weekday name (`"Sunday"` … `"Saturday"`) for a date, using the Sakamoto algorithm. Defaults to today.', example: 'getDay(18, 11, 2026)' },
  getMonth: { desc: 'Returns the month name for a **0-based** index (`0` = `"January"`).', example: 'getMonth(0)  // "January"' },
  getYear: { desc: 'Returns the year. Defaults to the current year.' },
  formatDate: { desc: 'Formats a date as `"Day, Month Year"`. Every argument defaults to today.', example: 'println(formatDate())' },

  // Json
  json_parse: { desc: 'Parses JSON `text` into Vivi values. On failure returns `null` and sets the error shown by `json_error()`.', example: 'v := json_parse("{\\"a\\": 1}")\nif json_error() != null { eprintln(json_error()) }' },
  json_parse_strict: { desc: 'Like `json_parse`, but panics with the error message instead of returning `null`.' },
  json_error: { desc: 'Returns the last parse error (`"json: <msg> (line N, column M)"`), or `null` if the last parse succeeded.' },
  json_stringify: { desc: 'Serializes a value to compact JSON text.', example: 'json_stringify([1, 2, 3])  // "[1,2,3]"' },
  json_pretty: { desc: 'Serializes a value to indented JSON. `indent` is a number of spaces (default `2`) or a string to use as the indent.', example: 'println(json_pretty(data, 4))' },
  json_quote: { desc: 'Returns `s` as a quoted, escaped JSON string literal.' },

  // Vvtoml (vvtoml)
  toml_parse: {
    desc: 'Parses TOML `text` into nested tables. On failure returns `null` and sets the error shown by `toml_error()`. Supports tables, dotted keys, inline tables, arrays, strings (basic, literal and multi-line), integers, floats and booleans. Not supported: `[[array of tables]]`, dates and times, `\\u` escapes.',
    example: 'cfg := toml_parse(file_read("app.toml"))\nif toml_error() != null { eprintln(toml_error()) }',
  },
  toml_parse_strict: { desc: 'Like `toml_parse`, but panics with the error message instead of returning `null`.' },
  toml_error: { desc: 'Returns the last parse error (`"toml: <msg> (line N, column M)"`), or `null` if the last parse succeeded.' },
  toml_stringify: {
    desc: 'Serializes a table to TOML text. Plain values come first, then each sub-table under its own `[header]`. `null` values are skipped. Returns `""` for `null` or a plain value.',
    example: 'file_write("out.toml", toml_stringify(cfg))',
  },
  toml_quote: { desc: 'Returns `s` as a quoted, escaped TOML string.' },

  // Core methods
  len: { desc: 'Number of characters in a string, or elements in an array. Works as `.len` and `.len()`.' },
  char_at: { desc: 'Returns the character (rune) at index `i`.' },
  push: { desc: 'Appends `v` to the end of the array.' },
  pop: { desc: 'Removes and returns the last element of the array.' },
  add: { desc: 'Inserts `v` at index `i`.' },
  take: { desc: 'Removes and returns the element at index `i`.' },
  sort: { desc: 'Sorts the array.' },
  empty: { desc: 'Returns `true` if the array or string has no elements.' },
};

// Language data
// Signatures are "name(param, param := default)"; no parens = constant.

const MODULES = {
  Strings: [
    'index_of(str, substr, from := 0)', 'is_digit(c)', 'has_prefix(str, prefix)', 'has_suffix(str, suffix)',
    'contains(str, substr)', 'substring(str, start := null, end := null)', 'split(str, delimiter := null)',
    'join(str1, str2)', 'replace(str, target, replacement)', 'trim(str)', 'to_upper(str)', 'to_lower(str)',
    'reverse(str)', 'to_pascal_case(str)', 'to_camel_case(str)', 'to_snake_case(str)',
  ],
  Math: [
    'pi', 'e', 'phi', 'tau', 'inf', 'nan', 'epsilon', 'ln2', 'ln10',
    'abs(x)', 'min(a, b)', 'max(a, b)', 'clamp(x, low, high)', 'lerp(a, b, t)',
    'sign(x)', 'copysign(x, y)', 'trunc(x)', 'floor(x)', 'ceil(x)', 'round(x)',
    'fmod(x, y)', 'modf(x)', 'sqrt(x)', 'cbrt(x)', 'hypot(a, b)', 'pow(base, exponent)',
    'exp(x)', 'expm1(x)', 'log(x)', 'log10(x)', 'log2(x)',
    'sin(x)', 'cos(x)', 'tan(x)', 'asin(x)', 'acos(x)', 'atan(x)', 'atan2(y, x)',
    'sinh(x)', 'cosh(x)', 'tanh(x)', 'asinh(x)', 'acosh(x)', 'atanh(x)',
    'deg_to_rad(d)', 'rad_to_deg(r)', 'gcd(a, b)', 'lcm(a, b)', 'factorial(n)',
    'gamma(x)', 'erf(x)', 'erfc(x)',
  ],
  Io: [
    'println(...)', 'printf(fmt, ...)', 'eprint(...)', 'eprintln(...)', 'eprintf(fmt, ...)',
    'input(prompt)', 'read_line()',
    'file_create(path)', 'file_write(path, text)', 'file_append(path, text)',
    'file_exists(path)', 'file_read(path)', 'file_lines(path)',
    'clear_screen()', 'clear_line()', 'cursor_to(row, col)', 'cursor_hide()', 'cursor_show()',
    'ansi(code, text)', 'rgb(r, g, b, text)',
    'bold(s)', 'dim(s)', 'italic(s)', 'underline(s)', 'inverse(s)',
    'black(s)', 'red(s)', 'green(s)', 'yellow(s)', 'blue(s)',
    'magenta(s)', 'cyan(s)', 'white(s)', 'gray(s)',
    'bg_red(s)', 'bg_green(s)', 'bg_blue(s)',
  ],
  Sys: ['run(cmd)', 'capture(cmd)', 'feed(cmd, text)', 'pipe(left, right)', 'redirect(cmd, path)'],
  Time: [
    'program_start', 'now()', 'dt(c := now())', 'dateTime(c := now(), base_offset := 0)',
    'getTime(c := now(), base_offset := 0, zulu := true)',
    'getDay(d := today, m := today, y := today)', 'getMonth(m := today)', 'getYear(y := today)',
    'formatDate(d := getDay(), m := getMonth(), y := getYear())',
  ],
  Json: [
    'json_parse(text)', 'json_parse_strict(text)', 'json_error()',
    'json_stringify(v)', 'json_pretty(v, indent := 2)', 'json_quote(s)',
  ],
  // must have vvtoml installed https://github.com/XansiOnGit/vvtoml
  Vvtoml: [
    'toml_parse(text)', 'toml_parse_strict(text)', 'toml_error()',
    'toml_stringify(data)', 'toml_quote(s)',
  ],
};

// Extra info shown for modules that are not built in
const MODULE_NOTES = {
  Vvtoml: 'Needs vvtoml installed: https://github.com/XansiOnGit/vvtoml',
};

// always available: _base.vivi + core, reflection, raw builtins
const PRELUDE = [
  'stdout', 'stderr',
  'print(...)', 'fprint(fd, ...)', 'println(...)', 'printf(fmt, ...)', 'fprintf(fd, fmt, ...)',
  'eprint(...)', 'eprintln(...)', 'eprintf(fmt, ...)',
  'panic(str)', 'exit(code = 0)',
  'malloc(size)', 'free(ptr)', 'memcpy(dst, src, n)', 'timestamp()', 'traceback()',
  'rand()', 'seed(n)', 'hash(s)', 'cast(value, type)',
  'type_of(v)', 'kind_of(v)', 'type_name(v)', 'fields(v)', 'methods(v)',
  'has_field(v, name)', 'has_method(v, name)', 'has_function(name)', 'has_type(name)',
  'has_symbol(name)', 'is_type(v)', 'is_exported(name)', 'symbols()', 'functions()',
  'types()', 'constants()', 'imports()', 'emit(code)', 'eval(code)',
  'param(...)', 'return_type(...)',
  '_mmap(size)', '_munmap(ptr, size)', '_poke(ptr, value)', '_peek(ptr)',
];

const CORE_METHODS = [
  'len()', 'char_at(i)', 'push(v)', 'pop()', 'add(i, v)', 'take(i)', 'sort()', 'empty()',
];
const CORE_PROPERTIES = ['len'];

const KEYWORDS = [
  'if', 'else', 'while', 'for', 'in', 'switch', 'default', 'break', 'continue',
  'return', 'fallthrough', 'try', 'catch', 'defer', 'and', 'or', 'not', 'as',
  'fn', 'struct', 'enum', 'ext', 'local', 'static', 'self', 'argc', 'argv',
];
const CONSTANTS = ['true', 'false', 'null'];
const TYPES = [
  'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f16', 'f32', 'f64',
  'bool', 'string', 'rune', 'int', 'float', 'void',
];
const DIRECTIVES = [
  ['#import', '#import "${1|Strings,Math,Io,Sys,Time,Json,Vvtoml|}"', 'Import a module'],
  ['#phrase', '#phrase ${1:name} :: (${2:cond}, block ${3:body}) {\n\t$0\n}', 'Grammar extension (top level only)'],
  ['#method', '#method ${1:i32} ${2:name} :: () {\n\t$0\n}', 'Method chained onto a value'],
  ['#proctime', '#proctime ', 'Compile-time (proctime) code'],
  ['#interop', '#interop ', 'Interop declaration'],
];

const SNIPPETS = [
  ['func', 'name :: (args) { }', '${1:name} :: (${2}) {\n\t$0\n}'],
  ['main', 'void main :: (argc, argv)', 'void main :: (argc, argv) {\n\t$0\n}'],
  ['struct', 'struct block', 'struct ${1:Name} {\n\ti32 ${2:x}: 0,\n\ti32 ${3:y}: 0\n}'],
  ['enum', 'enum block', 'enum ${1:Name} {\n\t${2:A},\n\t${3:B}\n}'],
  ['for', 'for i := 0; i < n; i++', 'for ${1:i} := 0; $1 < ${2:n}; $1++ {\n\t$0\n}'],
  ['forin', 'for v in arr', 'for ${1:v} in ${2:arr} {\n\t$0\n}'],
  ['forr', 'for 0..n', 'for ${1:0}..${2:10} {\n\t$0\n}'],
  ['if', 'if block', 'if ${1:cond} {\n\t$0\n}'],
  ['ifelse', 'if / else', 'if ${1:cond} {\n\t$2\n} else {\n\t$0\n}'],
  ['while', 'while block', 'while ${1:cond} {\n\t$0\n}'],
  ['switch', 'switch block', 'switch ${1:value} {\n\t${2:1}:\n\t\t$3\n\tdefault:\n\t\t$0\n}'],
  ['try', 'try / catch', 'try {\n\t$1\n} catch (${2:err}) {\n\t$0\n}'],
  ['defer', 'defer statement', 'defer ${0}'],
  ['lambda', 'anonymous fn', '(${1}) {\n\t$0\n}'],
];

// Helpers

// Split on commas that are not nested in (), [] or {} or strings.
function splitTop(s) {
  const out = [];
  let depth = 0, cur = '', str = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (str) { cur += ch; if (ch === '\\') cur += s[++i] || ''; else if (ch === '"') str = false; continue; }
    if (ch === '"') { str = true; cur += ch; continue; }
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// "from := 0" / "i32 from := 0" / "code = 0" / "string str" / "..."
function parseParam(p) {
  const m = /^(.*?[^:=!<>])\s*:?=\s*(.+)$/.exec(p);
  const left = (m ? m[1] : p).trim();
  const name = left.split(/\s+/).pop();
  return { raw: p, name, def: m ? m[2].trim() : null };
}

function parseSig(sig) {
  const i = sig.indexOf('(');
  if (i === -1) return { name: sig, params: null };
  const inner = sig.slice(i + 1, sig.lastIndexOf(')')).trim();
  return { name: sig.slice(0, i), params: inner ? splitTop(inner).map(parseParam) : [] };
}

const esc = (s) => s.replace(/[\\$}]/g, '\\$&');

function docMarkdown(name, sig, source) {
  const d = DOCS[name];
  const md = new vscode.MarkdownString();
  md.appendCodeblock(sig || name, 'vivi');
  if (source) md.appendMarkdown(`*${source}*\n\n`);
  if (MODULE_NOTES[source]) md.appendMarkdown(`${MODULE_NOTES[source]}\n\n`);
  if (d) {
    md.appendMarkdown(d.desc);
    if (d.example) md.appendMarkdown('\n\n**Example**').appendCodeblock(d.example, 'vivi');
  }
  return md;
}

function fnItem(sig, source, kind) {
  const { name, params } = parseSig(sig);
  const item = new vscode.CompletionItem(
    name,
    params === null ? vscode.CompletionItemKind.Constant : kind || vscode.CompletionItemKind.Function
  );
  item.detail = source ? `${sig}  (${source})` : sig;
  if (params !== null) {
    const body = params
      .map((p, i) => `\${${i + 1}:${esc(p.def !== null ? p.def : p.name === '...' ? 'value' : p.name)}}`)
      .join(', ');
    item.insertText = new vscode.SnippetString(`${name}(${body})`);
  }
  if (DOCS[name]) item.documentation = docMarkdown(name, sig, source);
  return item;
}

// name -> { sig, source } for hover and signature help
const SIG_INDEX = new Map();
for (const s of PRELUDE) { const { name } = parseSig(s); SIG_INDEX.set(name, { sig: s, source: 'prelude' }); }
for (const [mod, list] of Object.entries(MODULES)) {
  for (const s of list) {
    const { name } = parseSig(s);
    if (!SIG_INDEX.has(name)) SIG_INDEX.set(name, { sig: s, source: mod });
  }
}
for (const s of CORE_METHODS) { const { name } = parseSig(s); SIG_INDEX.set('.' + name, { sig: s, source: 'method' }); }

function parseImports(text) {
  const imports = [];
  const re = /^\s*#import\s+"(\w+)"(?:\s+as\s+(\w+))?/gm;
  let m;
  while ((m = re.exec(text))) imports.push({ module: m[1], alias: m[2] || null });
  return imports;
}

// Balanced-paren read starting at the '(' index.
function readBalanced(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return text.slice(open + 1, i);
  }
  return null;
}

// User-defined functions: `[type] name := (params)` / `name :: (params)`
function parseUserFns(text) {
  const fns = new Map();
  const re = /\b([A-Za-z_]\w*)\s*(?:::|:=)\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const open = m.index + m[0].length - 1;
    const inner = readBalanced(text, open);
    if (inner === null) continue;
    // only treat as function if a `{` follows the params
    const after = text.slice(open + inner.length + 2).trimStart();
    if (!after.startsWith('{')) continue;
    if (!fns.has(m[1])) fns.set(m[1], `${m[1]}(${inner.trim()})`);
  }
  return fns;
}

function parseSymbols(text) {
  const out = new Map();
  let m;
  const decl = /\b([A-Za-z_]\w*)\s*(?:::|:=)\s*(\()?/g;
  while ((m = decl.exec(text))) {
    if (!out.has(m[1])) out.set(m[1], m[2] ? 'function' : 'variable');
  }
  const typ = /\b(struct|enum)\s+([A-Za-z_]\w*)/g;
  while ((m = typ.exec(text))) out.set(m[2], m[1]);
  return out;
}

function parseEnums(text) {
  const enums = new Map();
  const re = /\benum\s+(\w+)\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    enums.set(m[1], m[2].split(',').map((s) => s.trim()).filter(Boolean));
  }
  return enums;
}

function parseDirectiveNames(text, directive) {
  const names = new Set();
  const re = new RegExp(`#${directive}\\s+(?:[\\w\\[\\]|]+\\s+)?(\\w+)\\s*(?:::|:=)`, 'g');
  let m;
  while ((m = re.exec(text))) names.add(m[1]);
  return names;
}

function insideString(prefix) {
  let open = false;
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] === '\\') { i++; continue; }
    if (prefix[i] === '"') open = !open;
  }
  return open;
}

function allModuleNames() {
  const extra = vscode.workspace.getConfiguration('vivi').get('extraModules', []);
  return [...new Set([...Object.keys(MODULES), ...extra])];
}

// Find the call being typed: { name, index, member } or null.
function findCall(prefix) {
  const stack = [];
  let str = false;
  for (let i = 0; i < prefix.length; i++) {
    const ch = prefix[i];
    if (str) { if (ch === '\\') i++; else if (ch === '"') str = false; continue; }
    if (ch === '"') { str = true; continue; }
    if (ch === '(') {
      const before = /(\.?)([A-Za-z_]\w*)\s*$/.exec(prefix.slice(0, i));
      stack.push({ name: before ? before[2] : null, member: before ? before[1] === '.' : false, index: 0 });
    } else if (ch === ',' && stack.length) stack[stack.length - 1].index++;
    else if (ch === ')') stack.pop();
  }
  for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name) return stack[i];
  return null;
}

// Completion

// Missing import check

const PRELUDE_NAMES = new Set(PRELUDE.map((x) => parseSig(x).name));

// library name -> { modules, isConst }. Names the prelude already has are left out.
const LIB_NAMES = new Map();
for (const [mod, list] of Object.entries(MODULES)) {
  for (const sig of list) {
    const { name, params } = parseSig(sig);
    if (PRELUDE_NAMES.has(name)) continue;
    if (params === null && name.length < 3) continue; // too short, like "e"
    if (!LIB_NAMES.has(name)) LIB_NAMES.set(name, { modules: [], isConst: params === null });
    LIB_NAMES.get(name).modules.push(mod);
  }
}
const LIB_CONSTS = [...LIB_NAMES].filter(([, v]) => v.isConst).map(([n]) => n);
const CONST_RE = new RegExp(`(?<![\\w.])(${LIB_CONSTS.join('|')})\\b(?!\\s*(?:::|:=|=[^=]|\\())`, 'g');
const CALL_RE = /(?<![\w.])([A-Za-z_]\w*)(?=\s*\()/g;

// Replace comments and strings with spaces so we only look at real code.
// The text keeps the same length, so positions still line up.
function blankNonCode(text) {
  const out = text.split('');
  const n = text.length;
  const blank = (from, to) => {
    for (let k = from; k < to && k < n; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  let i = 0;
  while (i < n) {
    const c = text[i];
    const d = text[i + 1];
    if (c === '/' && d === '*') {
      const end = text.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      blank(i, stop);
      i = stop;
    } else if (
      (c === '/' && d === '/') ||
      (c === ';' && d === ';') ||
      (c === '#' && !/^#(proctime|import|interop|method|phrase)\b/.test(text.slice(i, i + 10)))
    ) {
      let stop = text.indexOf('\n', i);
      if (stop === -1) stop = n;
      blank(i, stop);
      i = stop;
    } else if (c === '"') {
      let j = i + 1;
      while (j < n && text[j] !== '"' && text[j] !== '\n') {
        if (text[j] === '\\') j++;
        j++;
      }
      blank(i, j + 1);
      i = j + 1;
    } else if (c === "'") {
      const m = /^'(?:\\.|[^'\\\n])'/.exec(text.slice(i, i + 6));
      if (m) {
        blank(i, i + m[0].length);
        i += m[0].length;
      } else i++;
    } else i++;
  }
  return out.join('');
}

// Is the module imported plainly, or only through an alias?
function importState(text, mod) {
  let flat = false;
  let alias = null;
  for (const imp of parseImports(text)) {
    if (imp.module !== mod) continue;
    if (imp.alias) alias = imp.alias;
    else flat = true;
  }
  return { flat, alias };
}

// Where a new #import line should go: after the last import, or at the top.
function importEdit(doc, mod) {
  let last = -1;
  for (let i = 0; i < doc.lineCount; i++) {
    if (/^\s*#import\b/.test(doc.lineAt(i).text)) last = i;
  }
  const line = `#import "${mod}"`;
  if (last === -1) return vscode.TextEdit.insert(new vscode.Position(0, 0), line + '\n\n');
  if (last + 1 >= doc.lineCount) {
    return vscode.TextEdit.insert(new vscode.Position(last, doc.lineAt(last).text.length), '\n' + line);
  }
  return vscode.TextEdit.insert(new vscode.Position(last + 1, 0), line + '\n');
}

function updateDiagnostics(doc, collection) {
  if (doc.languageId !== 'vivi') return;
  const cfg = vscode.workspace.getConfiguration('vivi');
  if (!cfg.get('warnMissingImports', true)) {
    collection.delete(doc.uri);
    return;
  }

  const text = doc.getText();
  const code = blankNonCode(text);
  const defined = parseSymbols(text);
  const diags = [];

  const report = (name, index) => {
    const info = LIB_NAMES.get(name);
    if (!info || defined.has(name)) return;
    const states = info.modules.map((mod) => ({ mod, ...importState(text, mod) }));
    if (states.some((st) => st.flat)) return;
    const first = states[0];
    let msg;
    if (first.alias) {
      msg = `"${name}" is in the ${first.mod} library, which you imported as "${first.alias}". Use ${first.alias}.${name} instead.`;
    } else {
      msg = `"${name}" is from the ${info.modules.join(' or ')} library. Add #import "${first.mod}" to use it.`;
      if (MODULE_NOTES[first.mod]) msg += ` ${MODULE_NOTES[first.mod]}`;
    }
    const range = new vscode.Range(doc.positionAt(index), doc.positionAt(index + name.length));
    const d = new vscode.Diagnostic(range, msg, vscode.DiagnosticSeverity.Warning);
    d.source = 'vivi';
    d.code = first.alias ? 'alias' : first.mod;
    diags.push(d);
  };

  let m;
  CALL_RE.lastIndex = 0;
  while ((m = CALL_RE.exec(code))) report(m[1], m.index);
  CONST_RE.lastIndex = 0;
  while ((m = CONST_RE.exec(code))) report(m[1], m.index);

  // #import "Name" where the module does not exist
  const known = new Set(allModuleNames());
  const importRe = /^([ \t]*#import[ \t]+")(\w+)"/gm;
  while ((m = importRe.exec(text))) {
    if (known.has(m[2])) continue;
    const start = m.index + m[1].length;
    const range = new vscode.Range(doc.positionAt(start), doc.positionAt(start + m[2].length));
    const d = new vscode.Diagnostic(
      range,
      `Unknown module "${m[2]}". Known modules: ${[...known].join(', ')}.`,
      vscode.DiagnosticSeverity.Warning
    );
    d.source = 'vivi';
    diags.push(d);
  }

  collection.set(doc.uri, diags);
}

// Quick fix: add the missing #import line
const importActions = {
  provideCodeActions(doc, range, ctx) {
    const actions = [];
    const done = new Set();
    for (const d of ctx.diagnostics) {
      if (d.source !== 'vivi' || typeof d.code !== 'string' || !MODULES[d.code] || done.has(d.code)) continue;
      done.add(d.code);
      const act = new vscode.CodeAction(`Add #import "${d.code}"`, vscode.CodeActionKind.QuickFix);
      act.diagnostics = [d];
      act.isPreferred = true;
      act.edit = new vscode.WorkspaceEdit();
      const edit = importEdit(doc, d.code);
      act.edit.insert(doc.uri, edit.range.start, edit.newText);
      actions.push(act);
    }
    return actions;
  },
};

function watchDiagnostics(context) {
  const collection = vscode.languages.createDiagnosticCollection('vivi');
  const timers = new Map();
  const schedule = (doc) => {
    const key = doc.uri.toString();
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => updateDiagnostics(doc, collection), 300));
  };
  for (const doc of vscode.workspace.textDocuments) updateDiagnostics(doc, collection);
  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument((d) => updateDiagnostics(d, collection)),
    vscode.workspace.onDidChangeTextDocument((e) => schedule(e.document)),
    vscode.workspace.onDidCloseTextDocument((d) => collection.delete(d.uri)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('vivi')) return;
      for (const d of vscode.workspace.textDocuments) updateDiagnostics(d, collection);
    })
  );
}

const completionProvider = {
  provideCompletionItems(doc, pos) {
    const prefix = doc.lineAt(pos).text.slice(0, pos.character);
    const text = doc.getText();
    const Kind = vscode.CompletionItemKind;

    // 1) #import "<module>"
    let m = /#import\s+"(\w*)$/.exec(prefix);
    if (m) {
      const imported = new Set(parseImports(text).map((i) => i.module));
      const range = new vscode.Range(pos.line, pos.character - m[1].length, pos.line, pos.character);
      return allModuleNames()
        .filter((n) => !imported.has(n))
        .map((n) => {
          const it = new vscode.CompletionItem(n, Kind.Module);
          it.range = range;
          it.detail = MODULES[n] ? `Vivi module (${MODULES[n].length} exports)` : 'Vivi module';
          if (MODULE_NOTES[n]) it.documentation = MODULE_NOTES[n];
          return it;
        });
    }

    // Skip comments and strings
    if (/^\s*(\/\/|;;|# )/.test(prefix) || /\/\/|;;/.test(prefix.replace(/"[^"]*"/g, ''))) return undefined;
    if (insideString(prefix)) return undefined;

    // 2) #directive
    m = /#(\w*)$/.exec(prefix);
    if (m) {
      const range = new vscode.Range(pos.line, pos.character - m[0].length, pos.line, pos.character);
      return DIRECTIVES.map(([label, snip, detail]) => {
        const it = new vscode.CompletionItem(label, Kind.Keyword);
        it.insertText = new vscode.SnippetString(snip);
        it.range = range;
        it.filterText = label;
        it.detail = detail;
        return it;
      });
    }

    // 3) member access: alias. / Enum. / value.
    m = /([A-Za-z_]\w*)\.(\w*)$/.exec(prefix);
    if (m) {
      const head = m[1];
      const imports = parseImports(text);
      const imp = imports.find((i) => i.alias === head);
      if (imp && MODULES[imp.module]) return MODULES[imp.module].map((s) => fnItem(s, imp.module));

      const enums = parseEnums(text);
      if (enums.has(head)) {
        return enums.get(head).map((n) => {
          const it = new vscode.CompletionItem(n, Kind.EnumMember);
          it.detail = `enum ${head}`;
          return it;
        });
      }

      const items = CORE_METHODS.map((s) => fnItem(s, 'method', Kind.Method));
      for (const p of CORE_PROPERTIES) {
        const it = new vscode.CompletionItem(p, Kind.Property);
        it.detail = 'property';
        if (DOCS[p]) it.documentation = docMarkdown(p, p, 'property');
        items.push(it);
      }
      for (const n of parseDirectiveNames(text, 'method')) {
        const it = new vscode.CompletionItem(n, Kind.Method);
        it.detail = '#method';
        items.push(it);
      }
      // flat-imported functions chain too (s.to_upper())
      for (const imp2 of imports.filter((i) => !i.alias)) {
        for (const s of MODULES[imp2.module] || []) {
          if (s.includes('(')) items.push(fnItem(s, imp2.module, Kind.Method));
        }
      }
      return items;
    }

    // 4) general completions
    const items = [];
    const seen = new Set();
    const push = (it) => {
      const label = typeof it.label === 'string' ? it.label : it.label.label;
      if (seen.has(label)) return;
      seen.add(label);
      items.push(it);
    };

    // Your own symbols first
    const userFns = parseUserFns(text);
    for (const [name, what] of parseSymbols(text)) {
      const kind =
        what === 'function' ? Kind.Function :
        what === 'struct' ? Kind.Struct :
        what === 'enum' ? Kind.Enum : Kind.Variable;
      const it = new vscode.CompletionItem(name, kind);
      it.detail = userFns.get(name) || what;
      it.sortText = '0' + name;
      push(it);
    }
    for (const p of parseDirectiveNames(text, 'phrase')) push(new vscode.CompletionItem(p, Kind.Keyword));

    for (const k of KEYWORDS) push(new vscode.CompletionItem(k, Kind.Keyword));
    for (const k of CONSTANTS) push(new vscode.CompletionItem(k, Kind.Constant));
    for (const t of TYPES) push(new vscode.CompletionItem(t, Kind.TypeParameter));

    for (const [label, detail, body] of SNIPPETS) {
      const it = new vscode.CompletionItem(label, Kind.Snippet);
      it.insertText = new vscode.SnippetString(body);
      it.detail = detail;
      items.push(it); // snippets may share names with keywords (if, for...), keep both
    }

    for (const s of PRELUDE) push(fnItem(s, 'prelude'));
    const imports = parseImports(text);
    for (const imp of imports) {
      if (imp.alias || !MODULES[imp.module]) continue; // namespaced -> only via alias.
      for (const s of MODULES[imp.module]) push(fnItem(s, imp.module));
    }
    for (const imp of imports) {
      if (!imp.alias) continue;
      const it = new vscode.CompletionItem(imp.alias, Kind.Module);
      it.detail = `namespace for ${imp.module}`;
      push(it);
    }

    // Functions from modules you have not imported yet. Picking one adds the #import line.
    if (vscode.workspace.getConfiguration('vivi').get('autoImport', true)) {
      for (const [mod, list] of Object.entries(MODULES)) {
        const st = importState(text, mod);
        if (st.flat || st.alias) continue;
        for (const sig of list) {
          const { name, params } = parseSig(sig);
          if (params === null && name.length < 3) continue;
          if (seen.has(name)) continue;
          const it = fnItem(sig, mod);
          it.detail = `${sig}  (auto-import ${mod})`;
          it.sortText = '9' + name;
          it.additionalTextEdits = [importEdit(doc, mod)];
          push(it);
        }
      }
    }
    return items;
  },
};

// Hover

const hoverProvider = {
  provideHover(doc, pos) {
    const range = doc.getWordRangeAtPosition(pos, /[A-Za-z_]\w*/);
    if (!range) return undefined;
    const line = doc.lineAt(pos).text;
    if (insideString(line.slice(0, range.start.character))) return undefined;
    const word = doc.getText(range);
    const isMember = range.start.character > 0 && line[range.start.character - 1] === '.';

    // user function defined in this file
    const userSig = parseUserFns(doc.getText()).get(word);
    if (userSig && !DOCS[word]) {
      const md = new vscode.MarkdownString().appendCodeblock(userSig, 'vivi');
      return new vscode.Hover(md, range);
    }

    const entry = (isMember && SIG_INDEX.get('.' + word)) || SIG_INDEX.get(word);
    if (entry) {
      const md = docMarkdown(word, entry.sig, entry.source);
      if (MODULES[entry.source] && !PRELUDE_NAMES.has(word)) {
        const st = importState(doc.getText(), entry.source);
        if (!st.flat && !st.alias) md.appendMarkdown(`\n\n**Not imported.** Add \`#import "${entry.source}"\` to use it.`);
      }
      return new vscode.Hover(md, range);
    }
    if (DOCS[word]) return new vscode.Hover(docMarkdown(word, word), range);
    return undefined;
  },
};

// Signature help

const signatureProvider = {
  provideSignatureHelp(doc, pos) {
    const prefix = doc.lineAt(pos).text.slice(0, pos.character);
    const call = findCall(prefix);
    if (!call) return undefined;

    let sig;
    const userSig = parseUserFns(doc.getText()).get(call.name);
    if (userSig) sig = userSig;
    else {
      const entry = (call.member && SIG_INDEX.get('.' + call.name)) || SIG_INDEX.get(call.name);
      if (!entry) return undefined;
      sig = entry.sig;
    }

    const { params } = parseSig(sig);
    if (params === null) return undefined;

    const info = new vscode.SignatureInformation(sig, DOCS[call.name] ? docMarkdown(call.name, null) : undefined);
    info.parameters = params.map((p) => new vscode.ParameterInformation(p.raw));
    const help = new vscode.SignatureHelp();
    help.signatures = [info];
    help.activeSignature = 0;
    // variadic: keep highlighting the last parameter
    const variadic = params.length && params[params.length - 1].name === '...';
    help.activeParameter = Math.min(call.index, Math.max(params.length - 1, 0));
    if (!variadic && call.index >= params.length) help.activeParameter = params.length; // past the end
    return help;
  },
};

function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider('vivi', completionProvider, '#', '.', '"'),
    vscode.languages.registerHoverProvider('vivi', hoverProvider),
    vscode.languages.registerSignatureHelpProvider('vivi', signatureProvider, '(', ','),
    vscode.languages.registerCodeActionsProvider('vivi', importActions, {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    })
  );
  watchDiagnostics(context);
}

function deactivate() {}

module.exports = { activate, deactivate };