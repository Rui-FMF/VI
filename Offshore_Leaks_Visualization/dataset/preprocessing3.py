import csv
import datetime
import calendar

months= {month.lower(): index for index, month in enumerate(calendar.month_abbr) if month}
reverse_months = {index:month.lower() for index, month in enumerate(calendar.month_abbr) if month}

def getYears(begin, end):
    if end:
        end = end.replace(' ', '-').split("-")
        if end[1].isdigit():
            end_date= end[2]+'-'+str(months[end[0].lower()])
        else:
            end_date= end[2]+'-'+str(months[end[1].lower()])

    else:
        end_date = 'None'
    
    begin = begin.strip().replace(' ', '-').replace(',', '').split("-")
    if begin[1].isdigit() and len(begin[0])<4:
        beg_date= begin[2]+'-'+str(months[begin[0].lower()])
    elif begin[1].isdigit():
        beg_date= begin[0]+'-'+reverse_months[int(begin[1])]
    else:
        beg_date= begin[2]+'-'+str(months[begin[1].lower()])



    return beg_date,end_date


with open('nodes-entities.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader,None)
    
    with open('dataset3.csv', 'w', newline='') as csvfile:
        writer = csv.writer(csvfile, delimiter=',',  quotechar='"')
        writer.writerow(['id', 'start_date', 'end_date', 'country'])
        for row in reader:
            # tem de ter pais e data de inicio 
            if row[17] and row[10]:
                country=row[17].split(";")
                for i in range(len(country)):
                    b_year, e_year=getYears(row[10], row[11])
                    w_row = [row[0],b_year,e_year,country[i]]
                    writer.writerow(w_row)


