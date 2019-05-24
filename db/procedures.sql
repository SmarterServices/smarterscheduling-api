CREATE OR REPLACE FUNCTION %schemaName%.fn_get_appointment_availability(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer)
 RETURNS TABLE("startDateTime" timestamp without time zone, "endDateTime" timestamp without time zone, "seatCount" integer, duration integer)
 LANGUAGE plpgsql
AS $function$


BEGIN



 RETURN QUERY

  SELECT '2018-09-22 22:00:00.000000'::timestamp without time zone, '2018-09-22 23:00:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:15:00.000000'::timestamp without time zone, '2018-09-22 23:15:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:30:00.000000'::timestamp without time zone, '2018-09-22 23:30:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:45:00.000000'::timestamp without time zone, '2018-09-22 23:45:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 23:00:00.000000'::timestamp without time zone, '2018-09-22 24:00:00.000000'::timestamp without time zone, 2, $4;

 END
$function$
;

CREATE OR REPLACE FUNCTION %schemaName%.fn_get_appointment_availability_with_seat_detail(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer)
 RETURNS TABLE("startDateTime" timestamp without time zone, "seatSid" character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN

 RETURN QUERY

  SELECT DISTINCT time,s.sid__c as seat
  from %schemaName%.sc_calendar__c c
  join %schemaName%.sc_calendar_seat__c cs
    on c.sid__c = cs.calendar__r__sid__c
  join %schemaName%.sc_seat__c s
    on s.sid__c = cs.seat__r__sid__c
  join %schemaName%.sc_schedule__c ss
    on ss.sid__c = s.schedule__r__sid__c or ss.calendar__r__sid__c = c.sid__c
  join generate_series(round_minutes($2, ss.interval__c)::timestamp without time zone,
                      ($3)::timestamp without time zone,
                      (ss.interval__c||' minute')::interval) as time on true
   -- First reduce the returned times by any that share the same day of week as an avalibility and are within start and end time of that avalibility
   -- This will remove all times that fall outside any know avalibilities for a given schedule
   join (select aa.sid as sid,aa.schedule_sid as schedule_sid,aa.start_time as start_time,aa.end_time as end_time,aa.dow as dow, aa.start_date_time as start_date_time, aa.end_date_time as end_date_time
         from (select COALESCE(a2.sid__c,a1.sid__c) as sid,
                COALESCE(a2.schedule__r__sid__c,a1.schedule__r__sid__c) as schedule_sid,
                COALESCE(a2.start_time__c,a1.start_time__c) as start_time,
                COALESCE(a2.end_time__c,a1.end_time__c) as end_time,
                COALESCE(a2.day_of_week__c,a1.day_of_week__c) as dow,
                COALESCE(a2.start_date__c,a1.start_date__c) as start_date_time,
                COALESCE(a2.end_date__c,a1.end_date__c) as end_date_time
              from %schemaName%.sc_availability__c a1
                LEFT JOIN %schemaName%.sc_availability__c a2
                  on a1.day_of_week__c = a2.day_of_week__c and a2.start_date__c is not null and a1.schedule__r__sid__c = a2.schedule__r__sid__c
                -- had to remove this b/c it is not null
                --where a1.start_date__c is null
              ) as aa
          ) a
       on a.schedule_sid = ss.sid__c
      and ((extract(dow from time) = a.dow) and time::time BETWEEN a.start_time and a.end_time and time::time + INTERVAL '60' minute BETWEEN a.start_time and a.end_time)
      and (time BETWEEN a.start_date_time and a.end_date_time or (a.start_date_time is null or a.end_date_time is null)) or false
where time BETWEEN $2 AND $3
 and c.sid__c = $1

 AND NOT EXISTS (
                 SELECT 1
                 FROM %schemaName%.sc_appointment__c app
                 WHERE (app.start_date__c BETWEEN $2 AND $3 or app.end_date__c between $2 AND $3)
                        and ((app.start_date__c, app.end_date__c) OVERLAPS (time,time + INTERVAL '60 minute' + INTERVAL '1 minute' * ss.end_buffer__c))
                        and app.seat__r__sid__c = s.sid__c
 )
  AND NOT EXISTS (
                 SELECT 1
                 FROM %schemaName%.sc_availability_exclusion__c ave
                 where ave.schedule__r__sid__c = ss.sid__c and (extract(dow from time) = ave.day_of_week__c) and (time::time BETWEEN ave.start_time__c and ave.end_time__c or (time + INTERVAL '60' minute)::time BETWEEN ave.start_time__c and ave.end_time__c) and ((time BETWEEN ave.start_date__c and ave.end_date__c) or (ave.start_date__c is null or ave.end_date__c is null))
   )
  ORDER BY time;
 END
$function$
;


CREATE OR REPLACE FUNCTION %schemaName%.fn_get_appointment_availability_jason(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer)
 RETURNS TABLE("startDateTime" timestamp without time zone, "endDateTime" timestamp without time zone, "seatCount" integer, duration integer)
 LANGUAGE plpgsql
AS $function$


BEGIN



 RETURN QUERY

  SELECT '2018-09-22 22:00:00.000000'::timestamp without time zone, '2018-09-22 23:00:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:15:00.000000'::timestamp without time zone, '2018-09-22 23:15:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:30:00.000000'::timestamp without time zone, '2018-09-22 23:30:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 22:45:00.000000'::timestamp without time zone, '2018-09-22 23:45:00.000000'::timestamp without time zone, 2, $4
  UNION
  SELECT '2018-09-22 23:00:00.000000'::timestamp without time zone, '2018-09-22 24:00:00.000000'::timestamp without time zone, 2, $4;

 END
$function$
;

CREATE OR REPLACE FUNCTION %schemaName%.fn_get_appointment_availability_with_seat_detail_jason(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer)
 RETURNS TABLE("startDateTime" timestamp without time zone, "seatSid" character varying)
 LANGUAGE plpgsql
AS $function$
BEGIN

 RETURN QUERY

 SELECT DISTINCT (time at time zone 'UTC') as time,s.sid__c as seat

     --, a.dow, a.start_time,a.start_date_time, a.end_time,  a.end_date_time, schedule_sid


   from %schemaName%.sc_calendar__c c
   join %schemaName%.sc_location__c l
       ON l.sid__c = c.scheduling_location__r__sid__c
   left join %schemaName%.time_zones__c tz
       ON tz.sid__c = l.time_zone__r__sid__c
   join %schemaName%.sc_calendar_seat__c cs
     on c.sid__c = cs.calendar__r__sid__c
   join %schemaName%.sc_seat__c s
     on s.sid__c = cs.seat__r__sid__c
   join %schemaName%.sc_schedule__c ss
     on ss.sid__c = s.schedule__r__sid__c or ss.calendar__r__sid__c = c.sid__c
   join generate_series(%schemaName%.round_minutes($2, ss.interval__c)::timestamp at time zone 'UTC', ($3)::timestamp at time zone 'UTC', (ss.interval__c||' minute')::interval) as time on true
    -- First reduce the returned times by any that share the same day of week as an avalibility and are within start and end time of that avalibility
    -- This will remove all times that fall outside any know avalibilities for a given schedule
    join (
           SELECT aa.sid as sid,aa.schedule_sid as schedule_sid,aa.start_time as start_time,aa.end_time as end_time,aa.dow as dow, aa.start_date_time as start_date_time, aa.end_date_time as end_date_time,
               to_timestamp(EXTRACT(EPOCH FROM (start_date_time || ' ' || start_time)::timestamp at time zone 'UTC')) as time_stamp_start,
               to_timestamp(EXTRACT(EPOCH FROM (end_date_time || ' ' || end_time)::timestamp at time zone 'UTC')) as time_stamp_end
           FROM (
               SELECT DISTINCT a1.sid__c as sid,
                         a1.schedule__r__sid__c as schedule_sid,
                         a1.start_time__c as start_time,
                         a1.end_time__c as end_time,
                         a1.day_of_week__c as dow,
                         a1.start_date__c as start_date_time,
                         a1.end_date__c as end_date_time
                  FROM %schemaName%.sc_availability__c a1
                 WHERE a1.schedule__r__sid__c = (SELECT sid__c from %schemaName%.sc_schedule__c WHERE calendar__r__sid__c =  $1 LIMIT 1)
               ) as aa
              WHERE aa.schedule_sid = (SELECT sid__c from %schemaName%.sc_schedule__c WHERE calendar__r__sid__c = $1 LIMIT 1)
           ) a
        on a.schedule_sid = ss.sid__c
       AND (

            (extract(dow from (time at time zone coalesce(tz.name, 'America/New_York'))) = a.dow)
           AND (time at time zone coalesce(tz.name, 'America/New_York'))::time BETWEEN a.start_time and a.end_time
           AND (time at time zone coalesce(tz.name, 'America/New_York'))::time + (120 || ' minute')::interval BETWEEN a.start_time and a.end_time


           )
       AND ((time at time zone coalesce(tz.name, 'America/New_York'))::date BETWEEN a.start_date_time AND a.end_date_time)
 where 0=0
    AND time BETWEEN $2 AND $3
    AND c.sid__c = $1


  AND NOT EXISTS (
                  SELECT 1
                  FROM %schemaName%.sc_appointment__c app
                  WHERE (app.start_date__c BETWEEN $2 AND $3 or app.end_date__c between $2 AND $3)
                         and ((app.start_date__c, app.end_date__c) OVERLAPS (time,time + ($4 || ' minute')::interval + INTERVAL '1 minute' * ss.end_buffer__c))
                         and app.seat__r__sid__c = s.sid__c
  )
   AND NOT EXISTS (
                  SELECT 1
                  FROM %schemaName%.sc_availability_exclusion__c ave
                  where ave.schedule__r__sid__c = ss.sid__c and (extract(dow from time) = ave.day_of_week__c) and (time::time BETWEEN ave.start_time__c and ave.end_time__c or (time + ($4 || ' minute')::interval)::time BETWEEN ave.start_time__c and ave.end_time__c) and ((time BETWEEN ave.start_date__c and ave.end_date__c) or (ave.start_date__c is null or ave.end_date__c is null))
    )

   ORDER BY time;
 END
$function$
;


create function %schemaName%.fn_get_appointment_availability_with_seat_detail_final(calendarsid character varying, startdatetime timestamp with time zone, enddatetime timestamp with time zone, requestedduration integer) returns TABLE("startDateTime" timestamp without time zone, "seatSid" character varying)
LANGUAGE plpgsql
AS $function$
BEGIN

--raise notice 'calendarsid: %', $1;
--raise notice 'startdatetime: %', $2;
--raise notice 'enddatetime: %', $3;
--raise notice 'requestedduration: %', $4;
--raise notice 'at UTC: %', salesforce.round_minutes($2, 15)::timestamp at time zone 'UTC';
--raise notice 'at Eastern: %', salesforce.round_minutes($2, 15)::timestamp at time zone 'America/New_York';
--raise notice 'start time at Eastern: %', salesforce.round_minutes($2, 15)::timestamp at time zone 'UTC' at time zone 'America/New_York';
--raise notice 'end time at Eastern: %', ($3)::timestamp at time zone 'UTC' at time zone 'America/New_York';

 RETURN QUERY



   SELECT DISTINCT (time)::timestamp at time zone coalesce(tz.name, 'America/New_York') at time zone 'UTC' as time,s.sid__c as seat
  from salesforce.sc_calendar__c c
  join salesforce.sc_location__c l
      ON l.sid__c = c.scheduling_location__r__sid__c
  left join salesforce.time_zones__c tz
      ON tz.sid__c = l.time_zone__r__sid__c
  join salesforce.sc_calendar_seat__c cs
    on c.sid__c = cs.calendar__r__sid__c
  join salesforce.sc_seat__c s
    on s.sid__c = cs.seat__r__sid__c
  join salesforce.sc_schedule__c ss
    on ss.sid__c = s.schedule__r__sid__c or ss.calendar__r__sid__c = c.sid__c
  join generate_series(salesforce.round_minutes($2, ss.interval__c)::timestamp at time zone 'UTC' at time zone coalesce(tz.name, 'America/New_York'), ($3)::timestamp at time zone 'UTC' at time zone coalesce(tz.name, 'America/New_York'), (ss.interval__c||' minute')::interval) as time on true
   -- First reduce the returned times by any that share the same day of week as an avalibility and are within start and end time of that avalibility
   -- This will remove all times that fall outside any know avalibilities for a given schedule
   join (
          SELECT aa.sid as sid,aa.schedule_sid as schedule_sid,aa.start_time as start_time,aa.end_time as end_time,aa.dow as dow, aa.start_date_time as start_date_time, aa.end_date_time as end_date_time
          FROM (
              SELECT DISTINCT a1.sid__c as sid,
                        a1.schedule__r__sid__c as schedule_sid,
                        a1.start_time__c as start_time,
                        a1.end_time__c as end_time,
                        a1.day_of_week__c as dow,
                        a1.start_date__c as start_date_time,
                        a1.end_date__c as end_date_time
                 FROM salesforce.sc_availability__c a1
                WHERE a1.schedule__r__sid__c = (SELECT sid__c from salesforce.sc_schedule__c WHERE calendar__r__sid__c =  $1 LIMIT 1)
              ) as aa
             WHERE aa.schedule_sid = (SELECT sid__c from salesforce.sc_schedule__c WHERE calendar__r__sid__c = $1 LIMIT 1)
          ) a
       on a.schedule_sid = ss.sid__c

     AND (

           (extract(dow from (time )) = a.dow)
          AND (time )::time BETWEEN a.start_time and a.end_time
          AND (time)::time + ($4  || ' minute')::interval BETWEEN a.start_time and a.end_time
          AND ((time )::date BETWEEN a.start_date_time AND a.end_date_time)
          )

where 0=0
   AND (time)::timestamp at time zone coalesce(tz.name, 'America/New_York') at time zone 'UTC' BETWEEN $2 AND $3
   AND c.sid__c = $1


 AND NOT EXISTS (
                 SELECT 1
                 FROM salesforce.sc_appointment__c app
                 WHERE (app.start_date__c BETWEEN $2 AND $3 or app.end_date__c between $2 AND $3)
                        -- since we are dealing with the variable time in the schedules local timezone, we need to convert it back to UTC so we can check the appointment dates in the database.
                        and ((app.start_date__c, app.end_date__c) OVERLAPS (time  at TIME ZONE coalesce(tz.name, 'America/New_York') at TIME ZONE 'UTC' ,time  at TIME ZONE coalesce(tz.name, 'America/New_York') at TIME ZONE 'UTC' + ($4 || ' minute')::interval + INTERVAL '1 minute' * ss.end_buffer__c))
                        and app.seat__r__sid__c = s.sid__c
                        AND app.status__c <> 'cancelled'
 )
  AND NOT EXISTS (
                 SELECT 1
                 FROM salesforce.sc_availability_exclusion__c ave
                 WHERE ave.schedule__r__sid__c = ss.sid__c
                       AND (extract(dow from time) = ave.day_of_week__c)
                       AND (time::time BETWEEN ave.start_time__c AND ave.end_time__c
                            OR (time + ($4 || ' minute')::interval)::time BETWEEN ave.start_time__c AND ave.end_time__c)
                       AND ((time BETWEEN ave.start_date__c AND ave.end_date__c) OR (ave.start_date__c is null OR ave.end_date__c is null))
   )

  ORDER BY time;
  END
$function$
;


create function %schemaName%.fn_get_appointment_availability_final(calendarsid character varying, startdatetime timestamp without time zone, enddatetime timestamp without time zone, requestedduration integer) returns TABLE("startDateTime" timestamp without time zone, "endDateTime" timestamp without time zone, "seatCount" integer, duration integer)
LANGUAGE plpgsql
AS $function$
BEGIN

 RETURN QUERY

  SELECT d."startDateTime", d."startDateTime" + ($4 ||' minutes')::interval as endDateTime,  cast(COUNT(1) as INTEGER), $4 as duration
  FROM %schemaName%.fn_get_appointment_availability_with_seat_detail_final($1, $2, $3, $4) d
  GROUP BY d."startDateTime"
  ORDER BY d."startDateTime";

 END
 $function$
;








CREATE OR REPLACE FUNCTION %schemaName%.round_minutes(timestamp with time zone, double precision)
 RETURNS timestamp with time zone
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT
     date_trunc('hour', $1)
     +  cast(($2::varchar||' min') as interval)
     * round(
     (date_part('minute',$1)::float + date_part('second',$1)/ 60.)::float
     / $2::float
      )
$function$
;


CREATE OR REPLACE FUNCTION public.round_minutes(timestamp with time zone, double precision)
 RETURNS timestamp with time zone
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT
     date_trunc('hour', $1)
     +  cast(($2::varchar||' min') as interval)
     * round(
     (date_part('minute',$1)::float + date_part('second',$1)/ 60.)::float
     / $2::float
      )
$function$
;
