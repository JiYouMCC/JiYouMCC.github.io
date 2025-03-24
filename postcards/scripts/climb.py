from bs4 import BeautifulSoup
import requests
import time
post_link_list = [
    ['配对', '/sendpostcard/postcardDetail/1303952', 'CNSH40040']
    # the list from climb.js
]

# ignore warnings
requests.packages.urllib3.disable_warnings()


# List of URLs to scan
urls = [
    '/sendpostcard/postcardDetail/1303952'
]

print('no,id,title,type,platform,friend_id,country,region,sent_date,received_date,tags,url,friend_url')

for url in post_link_list:
    response = requests.get("https://icardyou.icu"+url[1], verify=False)
    soup = BeautifulSoup(response.content, 'html.parser')

    # 1. no = blank
    print(',', end='')

    # 2. id
    print(url[2] + ',', end='')

    # 3. title = blank
    print(',', end='')

    # 4. type = url[0]
    print(url[0] + ',', end='')

    # 5. platform = icardyou
    print('icardyou,', end='')

    # 6. friend_id
    user_links = soup.find_all(
        'a', href=lambda href: href and href.startswith('/userInfo/homePage'))
    if user_links:
        print(user_links[0].get_text(strip=True), end='')
    print(',', end='')

    # 7. country = China
    print('China,', end='')

    # 8. region
    region_label = soup.find(
        'td', string=lambda string: string and "地区：" in string)
    if region_label:
        # Extract the region from the next td element
        region_value = region_label.find_next('td').get_text(strip=True)
        print(region_value, end='')
    print(',', end='')

    # 9. sent_date
    # Find the td element containing "发送时间："
    send_time_label = soup.find(
        'td', string=lambda string: string and "发送时间：" in string)
    if send_time_label:
        # Extract the date and time from the next td element
        send_time_value = send_time_label.find_next('td').get_text(strip=True)
        print(send_time_value, end='')
    print(',', end='')

    # 10. received_date
    send_time_label = soup.find(
        'td', string=lambda string: string and "到达时间：" in string)
    if send_time_label:
        # Extract the date and time from the next td element
        send_time_value = send_time_label.find_next('td').get_text(strip=True)
        print(send_time_value, end='')
    print(',', end='')

    # 11. tags = blank
    print(',', end='')

    # 12. url = url[1]
    print("https://icardyou.icu"+url[1]+',', end='')

    # 13. friend_url
    print("https://icardyou.icu"+user_links[0]['href'])

    # sleep 10 sec
    time.sleep(10)
