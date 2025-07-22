"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"

interface OvertimeDay {
  date: number
  hours: number
  isHoliday: boolean
}

interface OvertimeData {
  [key: string]: OvertimeDay
}

const nationalHolidays2025 = [
  '2025-01-01', '2025-01-29', '2025-03-31', '2025-04-18', 
  '2025-05-01', '2025-05-29', '2025-06-01', '2025-06-06',
  '2025-06-30', '2025-07-17', '2025-08-17', '2025-10-06', '2025-12-25'
]

export default function OvertimeCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [basicSalary, setBasicSalary] = useState(2436886)
  const [workExperience, setWorkExperience] = useState(0)
  const [overtimeData, setOvertimeData] = useState<OvertimeData>({})
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [overtimeHours, setOvertimeHours] = useState('')
  const [isHoliday, setIsHoliday] = useState(false)
  const [today, setToday] = useState(new Date())

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now)
    setToday(now)
  }, [])

  useEffect(() => {
    const savedOvertimeData = localStorage.getItem('overtimeData')
    const savedBasicSalary = localStorage.getItem('basicSalary')
    const savedWorkExperience = localStorage.getItem('workExperience')
    if (savedOvertimeData) setOvertimeData(JSON.parse(savedOvertimeData))
    if (savedBasicSalary) setBasicSalary(Number(savedBasicSalary))
    if (savedWorkExperience) setWorkExperience(Number(savedWorkExperience))
  }, [])

  useEffect(() => {
    localStorage.setItem('overtimeData', JSON.stringify(overtimeData))
  }, [overtimeData])
  useEffect(() => {
    localStorage.setItem('basicSalary', basicSalary.toString())
  }, [basicSalary])
  useEffect(() => {
    localStorage.setItem('workExperience', workExperience.toString())
  }, [workExperience])

  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
  const dayNames = ['Mgg','Snin','Slsa','Rbu','Kmis','Jmat','Sbtu']

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const isNationalHoliday = (year: number, month: number, date: number) => {
    const formattedDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`
    return nationalHolidays2025.includes(formattedDate)
  }

  const calculateWorkExperienceAllowance = (years: number) => years > 0 ? 5000 + ((years - 1) * 10000) : 0

  const calculateOvertimePay = (hours: number, isHoliday: boolean, base: number, exp: number) => {
    const allowance = calculateWorkExperienceAllowance(exp)
    const totalBasic = base + allowance
    const hourlyRate = totalBasic / 173
    if (isHoliday) {
      if (hours <= 7) return hours * hourlyRate * 2
      else if (hours === 8) return (7 * hourlyRate * 2) + (hourlyRate * 3)
      else return (7 * hourlyRate * 2) + (hourlyRate * 3) + ((hours - 8) * hourlyRate * 4)
    } else {
      if (hours <= 1) return hours * hourlyRate * 1.5
      else return (1 * hourlyRate * 1.5) + ((hours - 1) * hourlyRate * 2)
    }
  }

  const getTotalOvertimePay = () => Object.entries(overtimeData).reduce((total, [key, day]) => {
    const [year, month] = key.split('-').map(Number)
    if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
      total += calculateOvertimePay(day.hours, day.isHoliday, basicSalary, workExperience)
    }
    return total
  }, 0)

  const getTotalOvertimeHours = () => Object.entries(overtimeData).reduce((total, [key, day]) => {
    const [year, month] = key.split('-').map(Number)
    if (year === currentDate.getFullYear() && month === currentDate.getMonth()) {
      total += day.hours
    }
    return total
  }, 0)

  const handleDateClick = (date: number) => {
    setSelectedDate(date)
    const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${date}`
    const existing = overtimeData[key]
    if (existing) {
      setOvertimeHours(existing.hours.toString())
      setIsHoliday(existing.isHoliday)
    } else {
      setOvertimeHours('')
      setIsHoliday(isNationalHoliday(currentDate.getFullYear(), currentDate.getMonth(), date))
    }
  }

  const handleSaveOvertime = () => {
    if (selectedDate !== null && overtimeHours) {
      const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${selectedDate}`
      const hours = parseFloat(overtimeHours)
      if (hours > 0) {
        setOvertimeData(prev => ({ ...prev, [key]: { date: selectedDate, hours, isHoliday } }))
      } else {
        setOvertimeData(prev => { const newData = { ...prev }; delete newData[key]; return newData })
      }
      setSelectedDate(null)
      setOvertimeHours('')
      setIsHoliday(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const days = []
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)

    for (let i = 0; i < firstDay; i++)
      days.push(<div key={`empty-${i}`} className="h-16 border"></div>)

    for (let date = 1; date <= daysInMonth; date++) {
      const key = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${date}`
      const overtimeDay = overtimeData[key]
      const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), date).getDay()
      const isSunday = dayOfWeek === 0
      const isNational = isNationalHoliday(currentDate.getFullYear(), currentDate.getMonth(), date)
      const isHolidayCell = isSunday || isNational
      const isToday =
        currentDate.getFullYear() === today.getFullYear() &&
        currentDate.getMonth() === today.getMonth() &&
        date === today.getDate()

      days.push(
        <div
          key={date}
          onClick={() => handleDateClick(date)}
          className={clsx(
            "h-16 border cursor-pointer flex items-center justify-center relative text-sm font-medium",
            overtimeDay
              ? overtimeDay.isHoliday ? "bg-red-500 text-white" : "bg-yellow-400"
              : isHolidayCell ? "bg-red-500 text-white" : "bg-green-200",
            selectedDate === date && "ring-2 ring-blue-500"
          )}
        >
          <span className={clsx(
            "z-10",
            isToday && "border-2 border-blue-500 rounded-full px-2 py-1",
            (overtimeDay?.isHoliday || isHolidayCell) ? "text-white" : "text-black"
          )}>
            {date}
          </span>
          {overtimeDay && (
            <div className="absolute bottom-1 right-1 text-xs">
              {overtimeDay.hours}h
            </div>
          )}
        </div>
      )
    }
    return days
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <Button onClick={() => navigateMonth('prev')}><ChevronLeft /></Button>
          <h1 className="text-xl font-bold">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <Button onClick={() => navigateMonth('next')}><ChevronRight /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-yellow-100">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={clsx(
              "p-3 text-center font-bold border",
              index === 0 ? "text-red-600" : "text-black"
            )}
          >{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>

      <div className="mt-4">
        <Label>Gaji Pokok</Label>
        <Input type="number" value={basicSalary} onChange={(e) => setBasicSalary(Number(e.target.value))} />
        <Label className="mt-2">Masa Kerja (tahun)</Label>
        <Input type="number" value={workExperience} onChange={(e) => setWorkExperience(Number(e.target.value))} />
      </div>

      {selectedDate !== null && (
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Input Lembur Tanggal {selectedDate}</h2>
          <Input
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(e.target.value)}
            placeholder="Jam Lembur"
          />
          <Label className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              checked={isHoliday} 
              onChange={(e) => setIsHoliday(e.target.checked)} 
              className="w-4 h-4"
            /> Hari Libur
          </Label>
          <Button className="mt-2" onClick={handleSaveOvertime}>Simpan</Button>
        </div>
      )}

      <div className="mt-6 bg-gray-100 p-4 rounded">
        <h3 className="text-lg font-bold mb-2">Ringkasan Lembur</h3>
        <p>Total Jam: {getTotalOvertimeHours()} jam</p>
        <p>Total Upah: Rp {getTotalOvertimePay().toLocaleString('id-ID')}</p>
      </div>
    </div>
  )
}
