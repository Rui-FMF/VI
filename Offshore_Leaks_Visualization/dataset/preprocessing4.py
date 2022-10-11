import csv
import datetime
import calendar

months= {month.lower(): index for index, month in enumerate(calendar.month_abbr) if month}
reverse_months = {index:month.lower() for index, month in enumerate(calendar.month_abbr) if month}

dates=dict()
countries=list()

with open('dataset1.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader,None)
    for row in reader:
        countries.append(row[0])

countries = sorted(countries)

for y in range(1865,2023):
    for m in range(1,13):
        dates[str(y)+'-'+str(m)]={'total':0} | {c:0 for c in countries}

with open('dataset3.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader,None)
    for row in reader:
        country=row[3]
        start_date=row[1]
        end_date=row[2]

        s_date_tuple = (start_date.split('-')[0], start_date.split('-')[1])
        if end_date!='None':
            e_date_tuple = (end_date.split('-')[0], end_date.split('-')[1])

        for d in dates.keys():
            d_tuple = (d.split('-')[0], d.split('-')[1])
            if d_tuple>=s_date_tuple:
                dates[d]['total']+=1
                dates[d][country]+=1
            
            if end_date!='None':
                if d_tuple>=e_date_tuple:
                    dates[d]['total']-=1
                    dates[d][country]-=1

with open('dataset4.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',',  quotechar='"')
    writer.writerow(['date', 'total']+sorted(list(countries)))
    for k,v in dates.items():
        row=[k,v['total']]
        row+=[v[c] for c in countries ]
        writer.writerow(row)


