import pandas as pd
df = pd.read_csv("NS Loss Analysis OEE FY25.csv")
print(df.head())
print(df.columns)
df = df[['Month', ' L1  ', ' L2 ', ' L4 ', ' L5 ', ' YTD ']]
df.to_csv("NS Loss Analysis OEE FY25_01.csv", index=True)
print(df.head())
print('----------------------')
for i in range(5):
    print(i)
    if df.loc[i, 'Month'] == 'Total':
        df.loc[i, 'Month'] = 'YTD'
print(len(df))
for i in range(len(df)):
    print(i,df.iloc[i]["Month"])
for i in range(len(df)):
    if i == 5:
        print(i,df.iloc[i]["Month"])
c9 = df.iloc[9][' L1  ']
print(c9)
c17 = df.iloc[17][' L1  ']
print(c17)
# a = int(c13)/int(c21)
# print(a)
c9 = c9.replace(',','')
c17 = c17.replace(',','')
a = int(c17)/int(c9)
print(a)
c21 = df.iloc[21][' L1  ']
print(c21)
c21 = c21.replace(',','')
print(c21)
p = int(c21)/int(c17)
print(p)
c20 = df.iloc[20][' L1  ']
print(c20)
q = (int(c21)-float(c20))/int(c21)
print(q)
oee = a * p * q
print(oee)