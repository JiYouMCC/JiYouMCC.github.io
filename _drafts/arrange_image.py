import ffmpeg
from datetime import datetime
import os
import exifread

source_folder ='C:\\Users\\yecx\\OneDrive\\图片\\相机导入'
target_folder ='C:\\Users\\yecx\\OneDrive\\图片\\整理'

def get_creation_time(file_path):
    probe = ffmpeg.probe(file_path)
    format_info = probe['format']
    creation_time = format_info.get('tags', {}).get('creation_time', None)
    if creation_time is None:
        f = open(file_path, 'rb')
        tags = exifread.process_file(f)
        if 'EXIF DateTimeOriginal' in tags:
            creation_time = tags['EXIF DateTimeOriginal']
    if creation_time is None:
        creation_time = datetime.fromtimestamp(os.path.getmtime(file_path))
    return creation_time

def get_file_size(file_path):
    probe = ffmpeg.probe(file_path)
    format_info = probe['format']
    file_size = format_info.get('size', None)
    return file_size

def parse_date_with_am_pm(date_string):
    formats = [
        '%Y:%m:%d %I:%M:%S %p',
        '%Y:%m:%d %I:%M:%S',
        '%Y:%m:%d %H:%M:%S',
        '%Y-%m-%d %I:%M:%S %p',
        '%Y-%m-%dT%I:%M:%S %p',
        '%Y-%m-%dT%H:%M:%S.%fZ'
    ]

    if date_string:
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
        return None
    else:
        return None

def traverse_directory(root_dir):
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            file_path = os.path.join(root, file)
            time_string = get_creation_time(file_path)
            time_string = parse_date_with_am_pm(str(time_string))
            print(file_path, time_string)

traverse_directory(source_folder)


