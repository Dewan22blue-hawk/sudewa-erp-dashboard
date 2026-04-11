import sys
import re

def main():
    with open('tsc-errors3.txt', 'r') as f:
        lines = f.readlines()

    for line in lines:
        # Match error syntax
        # src/hooks/useDataHutang.ts(13,77): error TS2561: Object literal may only specify known properties, but 'perPage' does not exist ... Did you mean to write 'per_page'?
        m = re.match(r"^(.+\.tsx|.+\.ts)\((\d+),\d+\): error TS2561: .*but 'perPage' does not exist .* Did you mean to write 'per_page'\?", line)
        if m:
            file_path = m.group(1)
            line_num = int(m.group(2))
            
            with open(file_path, 'r') as f:
                content_lines = f.readlines()
            
            # Replace 'perPage' with 'per_page' on that line
            if 0 <= line_num - 1 < len(content_lines):
                original = content_lines[line_num - 1]
                content_lines[line_num - 1] = original.replace('perPage:', 'per_page:')
                content_lines[line_num - 1] = content_lines[line_num - 1].replace('perPage,', 'per_page,')
                with open(file_path, 'w') as f:
                    f.writelines(content_lines)
                print(f"Fixed perPage -> per_page in {file_path}:{line_num}")
                continue
                
        # Property 'per_page' does not exist ... Did you mean 'perPage'?
        m2 = re.match(r"^(.+\.tsx|.+\.ts)\((\d+),\d+\): error TS2551: Property 'per_page' does not exist .* Did you mean 'perPage'\?", line)
        if m2:
            file_path = m2.group(1)
            line_num = int(m2.group(2))
            
            with open(file_path, 'r') as f:
                content_lines = f.readlines()
            
            # Replace 'per_page' with 'perPage' on that line
            if 0 <= line_num - 1 < len(content_lines):
                original = content_lines[line_num - 1]
                content_lines[line_num - 1] = original.replace('per_page', 'perPage')
                with open(file_path, 'w') as f:
                    f.writelines(content_lines)
                print(f"Fixed per_page -> perPage in {file_path}:{line_num}")
                continue

if __name__ == '__main__':
    main()
