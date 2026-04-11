import re
import sys
import subprocess

def run_tsc():
    print("Running tsc...")
    result = subprocess.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True)
    return result.stdout

def fix_errors(output):
    lines = output.split('\n')
    fixed_count = 0
    for line in lines:
        # Match error patterns:
        
        # 1. 'per_page' does not exist... Did you mean 'perPage'?
        m = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Property 'per_page' does not exist .* Did you mean 'perPage'\?", line)
        if m:
            filepath, line_num = m.group(1), int(m.group(2))
            replace_in_line(filepath, line_num, 'per_page:', 'perPage:')
            replace_in_line(filepath, line_num, 'per_page,', 'perPage,')
            fixed_count += 1
            print(f"Fixed per_page -> perPage in {filepath}:{line_num}")
            
        # 2. 'perPage' does not exist... Did you mean 'per_page'?
        m2 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Property 'perPage' does not exist .* Did you mean 'per_page'\?", line)
        if m2:
            filepath, line_num = m2.group(1), int(m2.group(2))
            replace_in_line(filepath, line_num, 'perPage:', 'per_page:')
            replace_in_line(filepath, line_num, 'perPage,', 'per_page,')
            replace_in_line(filepath, line_num, '.perPage,', '.per_page,')
            fixed_count += 1
            print(f"Fixed perPage -> per_page in {filepath}:{line_num}")

        # 3. Object literal may only specify known properties, and 'perPage' does not exist...
        m3 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Object literal may only specify known properties, and 'perPage' does not exist.*", line)
        if m3:
            filepath, line_num = m3.group(1), int(m3.group(2))
            # Just blindly replace perPage: to per_page:
            replace_in_line(filepath, line_num, 'perPage:', 'per_page:')
            fixed_count += 1
            print(f"Fixed perPage -> per_page in {filepath}:{line_num}")

        # 4. Cannot find name 'per_page'. Did you mean 'perPage'?
        m4 = re.match(r"^(.+\.ts[x]?)\((\d+),\d+\): error TS[0-9]+: Cannot find name 'per_page'. Did you mean 'perPage'\?", line)
        if m4:
            filepath, line_num = m4.group(1), int(m4.group(2))
            replace_in_line(filepath, line_num, 'per_page', 'perPage')
            fixed_count += 1
            print(f"Fixed per_page -> perPage in {filepath}:{line_num}")
            
    return fixed_count

def replace_in_line(filepath, line_num, old, new):
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        idx = line_num - 1
        if 0 <= idx < len(lines):
            lines[idx] = lines[idx].replace(old, new)
            with open(filepath, 'w') as f:
                f.writelines(lines)
    except:
        pass

if __name__ == '__main__':
    for i in range(3):
        out = run_tsc()
        c = fix_errors(out)
        print(f"Iteration {i}: Fixed {c} errors.")
        if c == 0:
            break
    print("Done")
