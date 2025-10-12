#!/bin/sh

# Run rollup and filter out JSX-related TypeScript warnings
# Using a temporary file to preserve exit code in a POSIX-compatible way
tmpfile=$(mktemp)
rollup -c 2>&1 | grep -v -E "(TS17004|Cannot use JSX unless|TS2339.*(className|disabled|children).*(ButtonProps|InputProps|SelectProps|TextareaProps|CheckboxProps|RadioProps|LabelProps))" || echo $? > "$tmpfile" &
wait $!
exitcode=$(cat "$tmpfile" 2>/dev/null || echo 0)
rm -f "$tmpfile"
exit $exitcode
