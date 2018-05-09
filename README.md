# Aerial Bombing in World War 2 by Allies

Motivation: 
My affinity for aviation industry continue to grow as I choose this topic of aerial bombing. During World War 2, use of aircrafts as a part of army played a crucial role in the war. Axis had a strong presence in air with the name ‘Luftwaffe’ led by the German forces. ‘Luftwaffe’ was an imminent part of Blitzkrieg attack. Allies on the counterpart had several divisions governed by the British and USA. Also, aerial attacks on Pearl Harbour marked the full fledged entry of USA in the war, and Hiroshima and Nagasaki, which sort of ended the war. This motivated me to visualize the trends and perform slice and dice operations to visually inspects the number of missions commissioned by Allies as a part of World War 2.

Data:
The data comes from Theatre History of Operation Report by Lt Col Jenns Robertson of the US Air Force -  THOR. The data is sparse and continues to grow. Of all the data available, our focus is on only World War 2.
Cleaning the data: Majority of the time I spend in cleaning the data and reducing the sparsity nature. There were errors pertaining to the latitudes and longitudes recorded. Some were out of range or in some different formats listed in degrees and minutes. I cleaned the data both in Excel and Python, included in the package.
Eliminating the sparsity: When the data was compared to Allies vs Axis, there was very little information for Axis as opposed to Allies, which portrayed a wrong picture and numbers and proportions. There were several measures that could have been interesting such as the weight of the explosives or the impact or number of aircrafts in a complete mission and several others. But due to the sparsity they had to left out. Instead, I chose the number of missions as my measure.
Creating Dimensions and Measure:In order to treat the data for slicing and dicing, I have used library Crossfilter. To visualize this data structure of cubes (OLAP), I have used Dimensional Charting DC.js. Both of these libraries are built on top of D3.js. There are several part of these libraries which remain undeveloped specially the maps, which made it difficult to go around and consumed a great amount of time.
At the end of all the cleaning I have 120408

Designing:
Initial plan was to use spatial map and timeline as the basis for filtering, slicing and dicing through the data. However, the density of points was very high especially in European region and South-East Asia. It would have added tremendous load on the viewer to access the required data. This was easily avoiding by initially prototyping on Tableau and exploring the data a bit. Few of the iterations are shown below, where we are visualizing the spatial points and comparing trends country wise.

Maping origin and target country:


Maping on spatial cordinates:


After several iteration, I narrowed down on using Google Material design, which uses each chart as a Google Card and act as a container. This gives nice boundaries and containment perspectives. An image of card headers before visualizing is shown below.


Visual Cues:

I have used visual cues to help the users gain more perspective about the chart they are looking at.
From left to right: On clicking each it gives you all the filters applied to the data, lets you reset all the filters on that chart and the last one provides descriptive information.

Tooltip:
Tooltip is focused on single point which is visible by hovering over on the chart. 

Filtering and slicing and dicing:
All charts except the spatial distribution are clickable which performs filtering for the user. Clicking on the same component you can remove the filter. 


An example:
Filtering on timeline by brushing and linking technique:


Filtering by Theatre of Operation:

Here we have filtered on East Theatre of Operation.

Targeted Industries:
This chart is ordered by the mission counts targeted on specific industries. The viewer can look at top 6 and there is a category called Others that sum up all of the categories that doesn’t  come up in top 6.

