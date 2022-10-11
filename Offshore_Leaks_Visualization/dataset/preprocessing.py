import csv
import datetime

def getYears(begin, end):
    if end:
        end_year= int(end.replace(' ', '-').split("-")[2])
    else:
        end_year = int(datetime.date.today().year)
    beg_year= int(begin.replace(' ', '-').split("-")[2])

    return [y for y in range(beg_year,end_year+1)]


country_data=dict()
years_set=set()
with open('nodes-entities.csv', newline='') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader,None)
    for row in reader:
        # tem de ter pais e data de inicio 
        if row[17] and row[10]:
            c=row[17].split(";")
            c_name=row[18].split(";")
            for i in range(len(c)):
                if c[i] not in country_data:
                    years=getYears(row[10], row[11])
                    years_set=years_set.union(years)
                    country_data[c[i]]={"name": c_name[i]} | {y:1 for y in years}
                    
                else:
                    years=getYears(row[10], row[11])
                    years_set=years_set.union(years)
                    for y in years:
                        country_data[c[i]][y] = country_data[c[i]].get(y,0)+1

years= sorted(list(years_set))

with open('dataset1.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',',  quotechar='"')
    writer.writerow(['country_code', 'country_name'] + years)
    for k,v in country_data.items():
        row=[k,v['name']]
        row+=[v.get(y,'0') for y in years ]
        writer.writerow(row)


