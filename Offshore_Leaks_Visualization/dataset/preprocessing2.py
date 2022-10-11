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
with open('nodes-entities.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile, delimiter=',', quotechar='"')
    next(reader,None)
    for row in reader:
        # tem de ter pais e data de inicio 
        if row[5] and row[17] and row[10]:
            c=row[17].split(";")
            c_name=row[18].split(";")
            j= row[5]
            j_name = row[6]
            for i in range(len(c)):
                if (j+':'+c[i]) not in country_data:
                    years=getYears(row[10], row[11])
                    years_set=years_set.union(years)
                    country_data[(j+':'+c[i])]={"origin_name": c_name[i], "offshore_name": j_name} | {y:1 for y in years}
                    
                else:
                    years=getYears(row[10], row[11])
                    years_set=years_set.union(years)
                    for y in years:
                        country_data[(j+':'+c[i])][y] = country_data[(j+':'+c[i])].get(y,0)+1

years= sorted(list(years_set))

with open('dataset2.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',',  quotechar='"')
    writer.writerow(['origin_code', 'origin_name', 'offshore_code', 'offshore_name'] + years)
    for k,v in country_data.items():
        codes=k.split(':')
        row=[codes[1],v['origin_name'],codes[0],v['offshore_name']]
        row+=[v.get(y,'0') for y in years ]
        writer.writerow(row)


